import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { API_BASE_URL } from '../../config';

// get auth user
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useInvitation = () => {
  const [isLoadingInvitations, setIsLoadingInvitations] = useState(false);
  const [isAcceptingInvitation, setIsAcceptingInvitation] = useState(false);
  const [isDecliningInvitation, setIsDecliningInvitation] = useState(false);
  const [fetchInvitationsStatus, setFetchInvitationsStatus] = useState({
    success: false,
    error: null,
  });
  const [acceptInvitationStatus, setAcceptInvitationStatus] = useState({
    success: false,
    error: null,
  });
  const [declineInvitationStatus, setDeclineInvitationStatus] = useState({
    success: false,
    error: null,
  });
  const [invitations, setInvitations] = useState({});

  // fetch invitations for the auth user
  const fetchInvitations = useCallback(async () => {
    try {
      setIsLoadingInvitations(true);

      // get invitations (throw error if not found)
      const response = await fetch(`${API_BASE_URL}/invitations?query=${user.user_id}&search_fields[]=invite_from&search_fields[]=invite_to`).then((x) => x.json());
      if (response.code >= 400) throw new Error('Failed to get invitations');

      // transform results
      response.results = await Promise.all(
        response.results.map(async (invitation) => {
          // get details of inviteFrom user
          const inviteFromUser = await fetch(`${API_BASE_URL}/users/${invitation.invite_from}`).then((x) => x.json());
          if (inviteFromUser?.code >= 400) throw new Error('Failed to get invitations');

          // get details of inviteTo user
          const inviteToUser = await fetch(`${API_BASE_URL}/users/${invitation.invite_to}`).then((x) => x.json());
          if (inviteToUser?.code >= 400) throw new Error('Failed to get invitations');

          // get details of invitation status
          const status = await fetch(`${API_BASE_URL}/status/${invitation.status_id}`).then((x) => x.json());
          if (status?.code >= 400) throw new Error('Failed to get invitations');

          // get details of material for this invitation
          const material = await (async () => {
            const materials = await fetch(`${API_BASE_URL}/materials?query=${invitation.invite_id}&search_fields[]=invite_id`).then((x) => x.json());
            if (materials?.code >= 400) throw new Error('Failed to get invitations');
            const temporaryMaterial = materials?.results?.[0] || null;
            if (!temporaryMaterial) return null;

            // get details of material author
            const materialAuthor = await fetch(`${API_BASE_URL}/users/${temporaryMaterial.author_id}`).then((x) => x.json());
            if (materialAuthor?.code >= 400) throw new Error('Failed to get invitations');

            // get details of material source
            const materialSource = await fetch(`${API_BASE_URL}/source/${temporaryMaterial.source_id}`).then((x) => x.json());
            if (materialSource?.code >= 400) throw new Error('Failed to get invitations');

            // get details of material source
            const materialType = await fetch(`${API_BASE_URL}/material-type/${temporaryMaterial.type_id}`).then((x) => x.json());
            if (materialType?.code >= 400) throw new Error('Failed to get invitations');

            // update temporary material
            delete temporaryMaterial.author_id;
            delete temporaryMaterial.source_id;
            delete temporaryMaterial.type_id;
            temporaryMaterial.author = materialAuthor;
            temporaryMaterial.source = materialSource;
            temporaryMaterial.type = materialType;

            return temporaryMaterial;
          })();

          const transformedInvitation = {
            ...invitation,
            invite_from: inviteFromUser,
            invite_to: inviteToUser,
            status,
            material,
          };

          delete transformedInvitation.status_id;

          return transformedInvitation;
        }),
      );

      // filter out falsy data
      response.results = response.results.filter((x) => x.material);

      setFetchInvitationsStatus({
        success: true,
        error: null,
      });
      setInvitations({ ...response });
    } catch {
      setFetchInvitationsStatus({
        success: false,
        error: 'Failed to get invitations',
      });
    } finally {
      setIsLoadingInvitations(false);
    }
  }, [invitations, setInvitations]);

  // update a status linked to invitation
  const updateInvitationStatus = useCallback(async (statusId, statusBody = {}) => {
    const response = await fetch(`${API_BASE_URL}/status/${statusId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusBody),
    }).then((x) => x.json());

    if (response.code >= 400) throw new Error('Failed to update status');
    return response;
  }, []);

  // accepts an invitation
  const acceptInvitation = useCallback(async (inviteId) => {
    try {
      // find status for an invitation
      const temporaryInvitations = { ...invitations };
      const foundInvitation = (temporaryInvitations.results || [])
        .find((x) => x.invite_id === inviteId);
      if (!foundInvitation) return;

      setIsAcceptingInvitation(true);

      // update invitation status
      const statusId = foundInvitation.status.status_id;
      const status = await updateInvitationStatus(statusId, { status_name: 'accepted' });
      foundInvitation.status = status;

      setAcceptInvitationStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setAcceptInvitationStatus({
        success: false,
        error: null,
      }), 3000);
      setInvitations({ ...temporaryInvitations });
    } catch {
      setAcceptInvitationStatus({
        success: false,
        error: 'Failed to accept invite',
      });
    } finally {
      setIsAcceptingInvitation(false);
    }
  }, [invitations, setInvitations]);

  // rejects an invitation
  const declineInvitation = useCallback(async (inviteId) => {
    try {
      // find status for an invitation
      const temporaryInvitations = { ...invitations };
      const foundInvitation = (temporaryInvitations.results || [])
        .find((x) => x.invite_id === inviteId);
      if (!foundInvitation) return;

      setIsDecliningInvitation(true);

      // update invitation status
      const statusId = foundInvitation.status.status_id;
      const status = await updateInvitationStatus(statusId, { status_name: 'declined' });
      foundInvitation.status = status;

      setDeclineInvitationStatus({
        success: true,
        error: null,
      });
      setTimeout(() => setDeclineInvitationStatus({
        success: false,
        error: null,
      }), 3000);
      setInvitations({ ...temporaryInvitations });
    } catch {
      setDeclineInvitationStatus({
        success: false,
        error: 'Failed to decline invite',
      });
    } finally {
      setIsDecliningInvitation(false);
    }
  }, [invitations, setInvitations]);

  return {
    isLoadingInvitations,
    isAcceptingInvitation,
    isDecliningInvitation,
    fetchInvitationsStatus,
    acceptInvitationStatus,
    declineInvitationStatus,
    fetchInvitations,
    invitations,
    acceptInvitation,
    declineInvitation,
    setAcceptInvitationStatus,
    setDeclineInvitationStatus,
  };
};

export default useInvitation;
