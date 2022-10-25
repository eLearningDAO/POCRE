import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import moment from 'moment';
import { API_BASE_URL } from '../../../config';

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
      const litigationResponse = await fetch(`${API_BASE_URL}/litigations/${id}`).then((x) => x.json());
      if (litigationResponse.code >= 400) throw new Error('Failed to fetch litigation');

      // get details about litigation issuer
      const issuer = await fetch(`${API_BASE_URL}/users/${litigationResponse.issuer_id}`).then((x) => x.json());
      litigationResponse.issuer = issuer;
      delete litigationResponse.issuer_id;

      // get details about litigation assumed author
      const assumedAuthor = await fetch(`${API_BASE_URL}/users/${litigationResponse.assumed_author}`).then((x) => x.json());
      litigationResponse.assumed_author = assumedAuthor;

      // get details about litigation creation
      const creation = await fetch(`${API_BASE_URL}/creations/${litigationResponse.creation_id}`).then((x) => x.json());
      litigationResponse.creation = creation;
      delete litigationResponse.creation_id;

      // get details about litigation creation source
      const source = await fetch(`${API_BASE_URL}/source/${litigationResponse.creation.source_id}`).then((x) => x.json());
      litigationResponse.creation.source = source;
      delete litigationResponse.creation.source_id;

      // get details about litigation winner
      litigationResponse.winner = litigationResponse.issuer.user_id === litigationResponse.winner
        ? litigationResponse.issuer
        : litigationResponse.assumed_author;

      // get details about litigation material
      if (litigationResponse.material_id) {
        const material = await fetch(`${API_BASE_URL}/materials/${litigationResponse.material_id}`).then((x) => x.json());

        // get details about material recognition
        if (material.invite_id) {
          const invitation = await fetch(`${API_BASE_URL}/invitations/${material.invite_id}`).then((x) => x.json());
          invitation.status = await fetch(`${API_BASE_URL}/status/${invitation.status_id}`).then((x) => x.json());

          // update keys
          delete invitation.status_id;
          material.invite = invitation;
          delete material.invite_id;
        }

        // update keys
        litigationResponse.material = material;
        delete litigationResponse.material_id;
      }

      // get details about litigation invitation
      const invitations = await Promise.all(litigationResponse.invitations.map(
        // eslint-disable-next-line no-return-await
        async (inviteId) => {
          const invitation = await fetch(`${API_BASE_URL}/invitations/${inviteId}`).then((x) => x.json());
          const inviteTo = await fetch(`${API_BASE_URL}/users/${invitation.invite_to}`).then((x) => x.json());
          const status = await fetch(`${API_BASE_URL}/status/${invitation.status_id}`).then((x) => x.json());
          delete invitation.status_id;
          delete invitation.invite_to;
          invitation.invite_to = inviteTo;
          invitation.status = status;
          return invitation;
        },
      ));
      litigationResponse.invitations = invitations;

      // get details about litigation invitation
      const decisions = await Promise.all(litigationResponse.decisions.map(
        // eslint-disable-next-line no-return-await
        async (decisionId) => await fetch(`${API_BASE_URL}/decision/${decisionId}`).then((x) => x.json()),
      ));
      litigationResponse.decisions = decisions;

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
            await fetch(`${API_BASE_URL}/decision/${myDecision?.decision_id}`, {
              method: 'DELETE',
            }).then(() => null);
          }

          return litigation.decisions.filter((x) => x.maker_id !== authUser.user_id);
        }

        // update the vote
        if (myDecision) {
          myDecision.decision_status = voteStatus === voteStatusTypes.AGREED;
          await fetch(`${API_BASE_URL}/decision/${myDecision.decision_id}`, {
            method: 'PATCH',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              decision_status: myDecision.decision_status,
            }),
          }).then((x) => x.json());

          return [...decisions];
        }

        // cast a new vote
        const response = await fetch(`${API_BASE_URL}/decision`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            decision_status: voteStatus === voteStatusTypes.AGREED,
            maker_id: authUser.user_id,
          }),
        }).then((x) => x.json());

        return [...decisions, response];
      })();

      // update decision of litigation
      await fetch(`${API_BASE_URL}/litigations/${litigation.litigation_id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decisions: updatedDecisions.map((x) => x.decision_id),
        }),
      }).then((x) => x.json());

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
