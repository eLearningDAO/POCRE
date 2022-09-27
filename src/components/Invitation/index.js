/* eslint-disable no-return-await */
import {
  Grid, Typography, Snackbar, Alert,
} from '@mui/material';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import InvitationCard from './InvitationCard';
import useInvitation from './useInvitation';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function Invitation() {
  const {
    fetchInvitations,
    invitations,
    acceptInvitation,
    declineInvitation,
    acceptInvitationStatus,
    declineInvitationStatus,
    setAcceptInvitationStatus,
    setDeclineInvitationStatus,
  } = useInvitation();

  useEffect(() => {
    fetchInvitations();
  }, []);

  const onCloseAcceptNotificationPopup = () => {
    setAcceptInvitationStatus({
      success: false,
      error: null,
    });
  };

  const onCloseDeclineNotificationPopup = () => {
    setDeclineInvitationStatus({
      success: false,
      error: null,
    });
  };

  return (
    <Grid container>
      {(acceptInvitationStatus.success || acceptInvitationStatus.error) && (
      <Snackbar
        open
        onClose={onCloseAcceptNotificationPopup}
      >
        <Alert
          onClose={onCloseAcceptNotificationPopup}
          severity={acceptInvitationStatus.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {acceptInvitationStatus.success ? 'Invitation Accepted!' : acceptInvitationStatus.error}
        </Alert>
      </Snackbar>
      )}
      {(declineInvitationStatus.success || declineInvitationStatus.error) && (
      <Snackbar
        open
        onClose={onCloseDeclineNotificationPopup}
      >
        <Alert
          onClose={onCloseDeclineNotificationPopup}
          severity={declineInvitationStatus.success ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {declineInvitationStatus.success ? 'Invitation Declined!' : declineInvitationStatus.error}
        </Alert>
      </Snackbar>
      )}

      <Grid item xs={12}>
        <Typography className="inviationHeaderTitle" variant="h6">Where I am recognized as a co-creator</Typography>
      </Grid>

      {invitations?.results?.filter(
        (x) => x.material && x.invite_to.user_id === authUser.user_id,
      ).length > 0
        && (
        <Grid item xs={12} style={{ marginTop: '10px' }}>
          <Typography className="inviationSectionTitle" variant="h6">Inbox</Typography>
        </Grid>
        )}

      {invitations?.results?.map((x) => x.material && x.invite_to.user_id === authUser.user_id && (
        <Grid item xs={12} style={{ marginTop: '10px' }}>
          <InvitationCard
            materialTitle={x.material?.material_title}
            materialLink={x.material?.material_link}
            // canAccept={x.status.status_name === 'pending'}
            onAccept={async () => await acceptInvitation(x.invite_id)}
            // canDecline={x.status.status_name === 'pending'}
            onDecline={async () => await declineInvitation(x.invite_id)}
          />
        </Grid>
      ))}

      {invitations?.results?.filter(
        (x) => x.material && x.invite_from.user_id === authUser.user_id,
      ).length > 0
        && (
        <Grid item xs={12} className="invitationSentSection">
          <Typography className="inviationSectionTitle" variant="h6">Sent</Typography>
        </Grid>
        )}

      {invitations?.results?.map((x) => x.material
      && x.invite_from.user_id === authUser.user_id && (
        <Grid item xs={12} style={{ marginTop: '10px' }}>
          <InvitationCard
            // materialImageUrl={x.material?.material_link}
            materialTitle={x.material?.material_title}
            materialLink={x.material?.material_link}
          />
        </Grid>
      ))}

    </Grid>
  );
}

export default Invitation;
