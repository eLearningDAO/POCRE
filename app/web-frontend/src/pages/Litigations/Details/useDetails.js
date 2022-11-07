import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Decision, Litigation } from 'api/requests';
import moment from 'moment';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';

const user = authUser.get();

const voteStatusTypes = {
  AGREED: 'agreed',
  DISAGREED: 'disagreed',
  IMPARTIAL: 'impartial',
};

const useDetails = () => {
  const queryClient = useQueryClient();
  const [litigationId, setLitigationId] = useState(null);

  // fetch all litigations
  const {
    data: litigation,
    isError: isFetchLitigationError,
    isSuccess: isFetchLitigationSuccess,
    isLoading: isFetchingLitigation,
  } = useQuery({
    queryKey: [`litigation-${litigationId}`],
    queryFn: async () => {
      // get litigation details
      const toPopulate = ['issuer_id', 'assumed_author', 'winner', 'decisions', 'invitations', 'invitations.invite_to', 'invitations.status_id', 'material_id.invite_id.status_id', 'creation_id.source_id'];
      const litigationResponse = await Litigation.getById(litigationId, toPopulate.map((x) => `populate=${x}`).join('&'));

      // calculate litigation status
      litigationResponse.status = (() => {
        if (moment(litigationResponse.litigation_end).isBefore(new Date().toISOString()) || litigationResponse.reconcilate) return 'Closed';
        if (moment(litigationResponse.litigation_start).isAfter(new Date().toISOString())) return 'Opened';
        if (moment(litigationResponse.litigation_start).isBefore(new Date().toISOString()) && moment(litigationResponse.litigation_end).isAfter(new Date().toISOString())) return 'Waiting authorship recognition';
        return null;
      })();

      // check if closed
      litigationResponse.isClosed = false;
      if (
        moment(litigationResponse.litigation_end).isBefore(new Date().toISOString())
      || litigationResponse.reconcilate
      ) {
        litigationResponse.isClosed = true;
      }

      // calculate if auth user is a judge
      litigationResponse.isJudging = !!litigationResponse.invitations.some(
        (x) => x.invite_to.user_id === user?.user_id,
      );

      // calculate vote status
      const vote = litigationResponse?.decisions?.find((x) => x?.maker_id === user?.user_id);
      litigationResponse.voteStatus = !vote ? voteStatusTypes.IMPARTIAL
        : (vote.decision_status ? voteStatusTypes.AGREED : voteStatusTypes.DISAGREED);

      return { ...litigationResponse, decisions: litigationResponse?.decisions || [] };
    },
    staleTime: 100_000, // delete cached data after 100 seconds
    enabled: !!litigationId,
  });

  // update litigation vote
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
          maker_id: user.user_id,
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
