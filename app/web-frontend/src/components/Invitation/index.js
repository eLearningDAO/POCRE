/* eslint-disable no-return-await */
import {
  Grid, Snackbar, Alert, Button,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
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

  const [activeTab, setActiveTab] = useState('co-author-recognition');

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

        <div className="toggle-bar2">
          <Button
            className={`btn ${activeTab === 'co-author-recognition' && 'btn-active'}`}
            onClick={() => setActiveTab('co-author-recognition')}
          >
            My Co-author Recognitions
          </Button>
          <Button
            className={`btn ${activeTab === 'co-creations-recognized' && 'btn-active'}`}
            onClick={() => setActiveTab('co-creations-recognized')}
          >
            Co-creations Recognized by me
          </Button>
        </div>

        {activeTab === 'co-author-recognition' ? (invitations?.results?.filter(
          (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id,
        ).length === 0
          ? (
            <h3 className="m-auto p-64">Nothing here yet!</h3>
          )
          : invitations?.results?.filter(
            (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id,
          ).length > 0 && (
            <Grid
              width="100%"
              display="flex"
              flexDirection={{ xs: 'row', md: 'column' }}
              overflow={{ xs: 'scroll', md: 'initial' }}
              bgcolor="transparent"
              gap={{ xs: '16px' }}
              className="hidden-scrollbar"
              padding={{ xs: '12px', md: '0' }}
            >
              {invitations?.results?.map(
                (x) => x?.material && x?.invite_to?.user_id === authUser?.user_id && (
                  <InvitationCard
                    title={x?.material?.material_title}
                    mediaUrl={x?.material?.material_link}
                    description={x?.material?.material_description}
                    recognizedByUserName={x?.invite_from?.user_name}
                    creation={{
                      id: x?.creation?.creation_id,
                      title: x?.creation?.creation_title,
                      description: x?.creation?.creation_description,
                      source: x?.creation?.source?.site_url,
                      author: x?.creation?.author?.user_name,
                      date: moment(x?.creation?.creation_date).format('Do MMMM YYYY'),
                      materials: x?.creation?.materials?.map((y) => ({
                        title: y?.material_title,
                        fileType: y?.type?.type_name,
                        link: y?.material_link,
                        author: y?.author?.user_name,
                      })),
                    }}
                    creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
                    acceptedOn={x?.status?.status_name !== 'accepted' ? null : moment(x?.status?.action_made).format('Do MMMM YYYY')}
                    declinedOn={x?.status?.status_name !== 'declined' ? null : moment(x?.status?.action_made).format('Do MMMM YYYY')}
                    isPending={x?.status?.status_name === 'pending'}
                    canAccept={x?.status?.status_name === 'pending'}
                    canDecline={x?.status?.status_name === 'pending'}
                    onAccept={async () => await acceptInvitation(x?.invite_id)}
                    onDecline={async () => await declineInvitation(x?.invite_id)}
                  />
                ),
              )}
            </Grid>
          )) : null}

        {activeTab === 'co-creations-recognized' ? (invitations?.results?.filter(
          (x) => x?.material && x?.invite_from?.user_id === authUser?.user_id,
        ).length === 0
          ? (
            <h3 className="m-auto p-64">Nothing here yet!</h3>
          )
          : invitations?.results?.filter(
            (x) => x?.material && x?.invite_from?.user_id === authUser?.user_id,
          ).length > 0 && (
            <Grid
              width="100%"
              display="flex"
              flexDirection={{ xs: 'row', md: 'column' }}
              overflow={{ xs: 'scroll', md: 'initial' }}
              bgcolor="transparent"
              gap={{ xs: '16px' }}
              className="hidden-scrollbar"
              padding={{ xs: '12px', md: '0' }}
            >
              {invitations?.results?.map((x) => x?.material
                && x?.invite_from?.user_id === authUser?.user_id && (
                  <InvitationCard
                    title={x?.material?.material_title}
                    mediaUrl={x?.material?.material_link}
                    description={x?.material?.material_description}
                    recognizedByUserName={null}
                    awaitingRecognitionByUserName={x?.invite_to?.user_name}
                    creationDate={moment(x?.invite_issued).format('Do MMMM YYYY')}
                    isPending={x?.status?.status_name === 'pending'}
                    isAccepted={x?.status?.status_name === 'accepted'}
                    isDeclined={x?.status?.status_name === 'declined'}
                    canAccept={false}
                    canDecline={false}
                  />
              ))}
            </Grid>
          )) : null}

      </Grid>
    </>
  );
}

export default Invitation;
