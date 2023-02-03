import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Decision, Litigation } from 'api/requests';
import { CHARGES, TRANSACTION_PURPOSES } from 'config';
import moment from 'moment';
import { useState } from 'react';
import statusTypes from 'utils/constants/statusTypes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const user = authUser.getUser();

const voteStatusTypes = {
  AGREED: 'agreed',
  DISAGREED: 'disagreed',
  IMPARTIAL: 'impartial',
};

const toDate = (dateString) => new Date(dateString);

const useDetails = () => {
  const queryClient = useQueryClient();
  const [litigationId, setLitigationId] = useState(null);

  // fetch the litigation
  const {
    data: litigation,
    isError: isFetchLitigationError,
    isSuccess: isFetchLitigationSuccess,
    isLoading: isFetchingLitigation,
  } = useQuery({
    queryKey: [`litigation-${litigationId}`],
    queryFn: async () => {
      // get litigation details
      const toPopulate = [
        'assumed_author', 'winner', 'issuer_id', 'creation_id', 'creation_id.author_id', 'decisions',
        'decisions.maker_id', 'recognitions.recognition_for', 'material_id.author_id',
      ];
      const litigationResponse = await Litigation.getById(litigationId, toPopulate.map((x) => `populate=${x}`).join('&'));

      const now = moment();

      // calculate if auth user is a judge
      const isToJudge = !!(litigationResponse?.recognitions || []).some(
        (x) => x?.recognition_for?.user_id === user?.user_id,
      );
      litigationResponse.isJudging = isToJudge;

      // set default closed status
      litigationResponse.isClosed = false;

      // calculate litigation status
      litigationResponse.status = (() => {
        if (
          moment(toDate(litigationResponse?.reconcilation_start)).isBefore(now)
          && moment(toDate(litigationResponse?.reconcilation_end)).isAfter(now)
          && litigationResponse?.assumed_author_response === statusTypes.PENDING_RESPONSE
        ) {
          return 'In Reconcilation';
        }

        if (
          moment(toDate(litigationResponse?.voting_start)).isBefore(now)
          && moment(toDate(litigationResponse?.voting_end)).isAfter(now)
          && litigationResponse?.assumed_author_response === statusTypes.START_LITIGATION
          && !isToJudge
        ) {
          return 'In Voting';
        }

        if (
          moment(toDate(litigationResponse?.voting_start)).isBefore(now)
          && moment(toDate(litigationResponse?.voting_end)).isAfter(now)
          && litigationResponse?.assumed_author_response === statusTypes.START_LITIGATION
          && isToJudge
        ) {
          return 'To vote';
        }

        if (
          moment(toDate(litigationResponse?.voting_end)).isBefore(now)
          || litigationResponse?.assumed_author_response === statusTypes.WITHDRAW_CLAIM
          || (
            // no response from author in reconilation phase (author lost claim)
            moment(toDate(litigationResponse?.reconcilation_end)).isBefore(now)
            && litigationResponse?.assumed_author_response === statusTypes.PENDING_RESPONSE
          )) {
          return 'Closed';
        }

        return null;
      })();

      if (litigationResponse.status === 'Closed') {
        // update closed status
        litigationResponse.isClosed = true;

        litigationResponse.start_date = litigationResponse.reconcilation_start;
        litigationResponse.end_date = litigationResponse.voting_end;
      }

      if (['To vote', 'In Voting'].includes(litigationResponse.status)) {
        litigationResponse.start_date = litigationResponse.voting_start;
        litigationResponse.end_date = litigationResponse.voting_end;
      }

      if (litigationResponse.status === 'In Reconcilation') {
        litigationResponse.start_date = litigationResponse.reconcilation_start;
        litigationResponse.end_date = litigationResponse.reconcilation_end;
      }

      // calculate vote status
      const vote = litigationResponse?.decisions?.find((x) => x?.maker_id === user?.user_id);
      litigationResponse.voteStatus = !vote ? voteStatusTypes.IMPARTIAL
        : (vote.decision_status ? voteStatusTypes.AGREED : voteStatusTypes.DISAGREED);

      return {
        ...litigationResponse,
        decisions: litigationResponse?.decisions || [],
        start_date: moment(litigationResponse?.start_date).format('DD/MM/YYYY'), // moment auto converts utc to local time
        end_date: moment(litigationResponse?.end_date).format('DD/MM/YYYY'), // moment auto converts utc to local time
      };
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!litigationId,
  });

  // cast litigation vote
  const {
    mutate: castLitigationVote,
    isError: isCastingVoteError,
    isSuccess: isCastingVoteSuccess,
    isLoading: isCastingVote,
    reset: resetCastVoteStatus,
  } = useMutation({
    mutationFn: async (
      voteStatus,
    ) => {
      // check if litigation is closed
      if (litigation.isClosed) return;

      // check if vote is to be updated
      if (voteStatus === litigation.voteStatus) return;

      // make transaction
      const txHash = await transactADAToPOCRE({
        amountADA: CHARGES.LITIGATION.VOTE,
        purposeDesc: TRANSACTION_PURPOSES.LITIGATION.VOTE,
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          claimed_entity: litigation.material ? 'MATERIAL' : 'CREATION',
          creation_id: litigation.creation_id,
          material_id: litigation.material_id,
          vote: voteStatus,
          author_id: user?.user_id,
        },
      });

      if (!txHash) throw new Error('Failed to make transaction');

      const updatedDecisions = await (async () => {
        const decisions = [...litigation.decisions];

        // check if vote is already casted
        const myDecision = decisions.find((x) => x.maker_id === user.user_id);

        // check if vote is to be removed
        if (voteStatus === voteStatusTypes.IMPARTIAL) {
          if (myDecision?.decision_id) {
            // remove the vote
            await Decision.delete(myDecision?.decision_id).catch(() => null);
          }

          return litigation.decisions.filter((x) => x.maker_id !== user.user_id);
        }

        // update the vote
        if (myDecision) {
          myDecision.decision_status = voteStatus === voteStatusTypes.AGREED;
          await Decision.update(myDecision.decision_id, {
            decision_status: myDecision.decision_status,
          });

          return [...decisions];
        }

        // cast a new vote
        const response = await Decision.create({
          decision_status: voteStatus === voteStatusTypes.AGREED,
        });

        return [...decisions, response];
      })();

      // update decision of litigation
      await Litigation.update(litigation.litigation_id, {
        decisions: updatedDecisions.map((x) => x.decision_id),
      });

      // update queries
      const key = `litigation-${litigationId}`;
      queryClient.cancelQueries({ queryKey: [key] });
      queryClient.setQueryData([key], () => ({
        ...litigation,
        voteStatus,
        decisions: updatedDecisions,
      }));
    },
  });

  return {
    fetchLitigationDetails: (id) => setLitigationId(id),
    litigation,
    user,
    isFetchingLitigation,
    fetchLitigationStatus: {
      success: isFetchLitigationSuccess,
      error: isFetchLitigationError ? 'Failed to fetch litigation' : null,
    },
    isCastingVote,
    voteCastStatus: {
      success: isCastingVoteSuccess,
      error: isCastingVoteError ? 'Failed to cast your vote' : null,
    },
    castLitigationVote,
    voteStatusTypes,
    resetCastVoteStatus,
  };
};

export default useDetails;
