import Cookies from 'js-cookie';
import { useCallback, useState } from 'react';
import { Invitation, Material, Status } from 'api/requests';

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
      const recognitionToPopulate = ['invite_from', 'invite_to', 'status_id'];
      const response = await Invitation.getAll(`limit=1000&query=${user.user_id}&search_fields[]=invite_from&search_fields[]=invite_to&${recognitionToPopulate.map((x) => `populate=${x}`).join('&')}`);

      // transform results
      response.results = await Promise.all(
        response.results.map(async (invitation) => {
          // fields to populate
          const materialToPopulate = ['source_id', 'type_id', 'author_id'];
          const materials = await Material.getAll(`limit=1&query=${invitation.invite_id}&search_fields[]=invite_id&${materialToPopulate.map((x) => `populate=${x}`).join('&')}`);
          const temporaryMaterial = materials?.results?.[0] || null;

          return {
            ...invitation,
            material: temporaryMaterial,
          };
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
  const updateInvitationStatus = useCallback(
    async (
      statusId,
      statusBody = {},
    ) => await
    Status.update(statusId, statusBody),
    [],
  );

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
