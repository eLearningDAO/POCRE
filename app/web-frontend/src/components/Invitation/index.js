/* eslint-disable no-return-await */
import {
  Grid, Typography, Snackbar, Alert,
} from '@mui/material';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import moment from 'moment';
import InvitationCard from '../cards/InvitationCard';
import useInvitation from './useInvitation';
import './index.css';
import Loader from '../uicore/Loader';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function Invitation() {
  const {
    isLoadingInvitations,
    isAcceptingInvitation,
    isDecliningInvitation,
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

  if (isLoadingInvitations) return <div style={{ margin: 'auto' }} className="loader" />;
  if (invitations?.results?.length === 0) {
    return (
      <h4 className="heading h4 result-msg">
        No Invitations Found
      </h4>
    );
  }

  return (
    <>
      {(isAcceptingInvitation || isDecliningInvitation) && <Loader withBackdrop size="large" />}
      <Grid container spacing={2}>
        {(acceptInvitationStatus.success || acceptInvitationStatus.error) && (
        <Snackbar
          open
          onClose={onCloseAcceptNotificationPopup}
        >
          <Alert
            onClose={onCloseAcceptNotificationPopup}
            icon={false}
            className={acceptInvitationStatus.success ? 'bg-green color-white' : 'bg-red color-white'}
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
              icon={false}
              className={declineInvitationStatus.success ? 'bg-green color-white' : 'bg-red color-white'}
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

        {invitations?.results?.filter(
          (x) => x.material && x.invite_to.user_id === authUser.user_id,
        ).length > 0 && (
          <Grid
            xs={12}
            item
            display="flex"
            flexDirection={{ xs: 'row', md: 'column' }}
            overflow={{ xs: 'scroll', md: 'initial' }}
            bgcolor="transparent"
            gap={{ xs: '16px' }}
            className="hidden-scrollbar"
            padding={{ xs: '12px', md: '0' }}
          >
            {invitations?.results?.map(
              (x) => x.material && x.invite_to.user_id === authUser.user_id && (
              <Grid item xs={12} style={{ marginTop: '10px' }}>
                <InvitationCard
                  title={x.material?.material_title}
                  mediaUrl={x.material?.material_link}
                  description={x.material?.material_description}
                  recognizedByUserName={x.invite_from?.user_name}
                  creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
                  acceptedOn={x.status.status_name !== 'accepted' ? null : moment(x.status?.action_made).format('Do MMMM YYYY')}
                  declinedOn={x.status.status_name !== 'declined' ? null : moment(x.status?.action_made).format('Do MMMM YYYY')}
                  isPending={x.status.status_name === 'pending'}
                  canAccept={x.status.status_name === 'pending'}
                  canDecline={x.status.status_name === 'pending'}
                  onAccept={async () => await acceptInvitation(x.invite_id)}
                  onDecline={async () => await declineInvitation(x.invite_id)}
                />
              </Grid>
              ),
            )}
          </Grid>
        )}

        {invitations?.results?.filter(
          (x) => x.material && x.invite_from.user_id === authUser.user_id,
        ).length > 0
        && (
        <Grid item xs={12} className="invitationSentSection">
          <Typography className="inviationSectionTitle" variant="h6">Where I recognize someone else co-creations</Typography>
        </Grid>
        )}

        <Grid
          xs={12}
          item
          display="flex"
          flexDirection={{ xs: 'row', md: 'column' }}
          overflow={{ xs: 'scroll', md: 'initial' }}
          bgcolor="transparent"
          gap={{ xs: '16px' }}
          className="hidden-scrollbar"
          padding={{ xs: '12px', md: '0' }}
        >
          {invitations?.results?.map((x) => x.material
          && x.invite_from.user_id === authUser.user_id && (
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <InvitationCard
              title={x.material?.material_title}
              mediaUrl={x.material?.material_link}
              description={x.material?.material_description}
              creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
              isPending={x.status.status_name === 'pending'}
              canAccept={false}
              canDecline={false}
              recognizedByUserName={null}
            />
          </Grid>
          ))}
        </Grid>

      </Grid>
    </>
  );
}

export default Invitation;
