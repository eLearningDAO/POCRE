import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Decision, Litigation, Transaction } from 'api/requests';
import { CHARGES } from 'config';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import statusTypes from 'utils/constants/statusTypes';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import { transactADAToPOCRE } from 'utils/helpers/wallet';

const voteStatusTypes = {
  AGREED: 'agreed',
  DISAGREED: 'disagreed',
  IMPARTIAL: 'impartial',
};

const toDate = (dateString) => new Date(dateString);

const useDetails = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [litigationId, setLitigationId] = useState(null);
  const [user, setUser] = useState();

  useEffect(() => {
    setUser(authUser.getUser());
  }, []);

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

      // if non-issuer is visting draft litigation then redirect 404
      if (litigationResponse?.is_draft && litigationResponse?.issuer?.user_id !== user?.user_id) {
        navigate('/404');
        return;
      }

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
        if (litigationResponse?.is_draft) return 'In Draft';

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

      // eslint-disable-next-line consistent-return
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
        walletName: authUser.getUser()?.selectedWallet,
        metaData: {
          pocre_id: litigationId,
          pocre_entity: 'litigation',
          purpose: transactionPurposes.CAST_LITIGATION_VOTE,
        },
      });
      if (!txHash) throw new Error('Failed to make transaction');

      // make pocre transaction to store this info
      const transaction = await Transaction.create({
        transaction_hash: txHash,
        transaction_purpose: transactionPurposes.REDEEM_LITIGATED_ITEM,
      });

      // cast a vote
      const decision = await Decision.create({
        decision_status: voteStatus === voteStatusTypes.AGREED,
      });

      // update decision of litigation
      await Litigation.vote(litigation.litigation_id, {
        decision_id: decision.decision_id,
        transaction_id: transaction.transaction_id,
      });

      // update queries
      const key = `litigation-${litigationId}`;
      queryClient.cancelQueries({ queryKey: [key] });
      queryClient.setQueryData([key], () => ({
        ...litigation,
        voteStatus,
        decisions: [...litigation.decisions, decision],
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
