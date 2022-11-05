import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import moment from 'moment';
import { Decision, Litigation } from 'api/requests';

const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const voteStatusTypes = {
  AGREED: 'agreed',
  DISAGREED: 'disagreed',
  IMPARTIAL: 'impartial',
};

const useDetails = () => {
  const [isFetchingLitigation, setIsFetchingLitigation] = useState(false);
  const [isCastingVote, setIsCastingVote] = useState(false);
  const [litigation, setLitigation] = useState(null);
  const [fetchLitigationStatus, setFetchLitigationStatus] = useState({
    success: false,
    error: null,
  });
  const [voteCastStatus, setVoteCastStatus] = useState({
    success: false,
    error: null,
  });

  const fetchLitigationDetails = useCallback(async (id) => {
    try {
      setIsFetchingLitigation(true);

      // get litigation details
      const toPopulate = ['issuer_id', 'assumed_author', 'winner', 'decisions', 'invitations', 'invitations.invite_to', 'invitations.status_id', 'material_id.invite_id.status_id', 'creation_id.source_id'];
      const litigationResponse = await Litigation.getById(id, toPopulate.map((x) => `populate=${x}`).join('&'));
      if (litigationResponse.code >= 400) throw new Error('Failed to fetch litigation');

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
        (x) => x.invite_to.user_id === authUser.user_id,
      );

      // calculate vote status
      const vote = litigationResponse.decisions.find((x) => x.maker_id === authUser.user_id);
      litigationResponse.voteStatus = !vote ? voteStatusTypes.IMPARTIAL
        : (vote.decision_status ? voteStatusTypes.AGREED : voteStatusTypes.DISAGREED);

      setFetchLitigationStatus({
        success: true,
        error: null,
      });
      setLitigation({ ...litigationResponse });
      setTimeout(() => setFetchLitigationStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setFetchLitigationStatus({
        success: false,
        error: 'Failed to fetch litigation',
      });
    } finally {
      setIsFetchingLitigation(false);
    }
  }, []);

  const castLitigationVote = useCallback(async (voteStatus) => {
    try {
      // check if litigation is closed
      if (litigation.isClosed) return;

      // check if vote is to be updated
      if (voteStatus === litigation.voteStatus) return;

      // update loading state
      setIsCastingVote(true);

      const updatedDecisions = await (async () => {
        const decisions = [...litigation.decisions];

        // check if vote is already casted
        const myDecision = decisions.find((x) => x.maker_id === authUser.user_id);

        // check if vote is to be removed
        if (voteStatus === voteStatusTypes.IMPARTIAL) {
          if (myDecision?.decision_id) {
            // remove the vote
            await Decision.delete(myDecision?.decision_id);
          }

          return litigation.decisions.filter((x) => x.maker_id !== authUser.user_id);
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
          maker_id: authUser.user_id,
        });

        return [...decisions, response];
      })();

      // update decision of litigation
      await Litigation.update(litigation.litigation_id, {
        decisions: updatedDecisions.map((x) => x.decision_id),
      });

      setVoteCastStatus({
        success: true,
        error: null,
      });
      setLitigation({ ...litigation, decisions: updatedDecisions, voteStatus });
      setTimeout(() => setVoteCastStatus({
        success: false,
        error: null,
      }), 3000);
    } catch {
      setVoteCastStatus({
        success: false,
        error: 'Failed to fetch litigation',
      });
    } finally {
      setIsCastingVote(false);
    }
  }, [litigation]);

  return {
    isFetchingLitigation,
    isCastingVote,
    fetchLitigationStatus,
    voteCastStatus,
    litigation,
    fetchLitigationDetails,
    castLitigationVote,
    voteStatusTypes,
  };
};

export default useDetails;
