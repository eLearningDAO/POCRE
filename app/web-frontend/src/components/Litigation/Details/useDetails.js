// import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import moment from 'moment';
import { API_BASE_URL } from '../../../config';

// const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

const useDetails = () => {
  const [isFetchingLitigation, setIsFetchingLitigation] = useState(false);
  const [litigation, setLitigation] = useState(null);
  const [fetchLitigationStatus, setFetchLitigationStatus] = useState({
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
        ? litigationResponse.winner
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
          invitation.invite_to = inviteTo;
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

  return {
    isFetchingLitigation,
    fetchLitigationStatus,
    litigation,
    fetchLitigationDetails,
  };
};

export default useDetails;
