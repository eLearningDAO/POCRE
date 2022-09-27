/* eslint-disable no-return-await */
import { Grid, Typography } from '@mui/material';
import React, { useEffect } from 'react';
import Cookies from 'js-cookie';
import InvitationCard from './InvitationCard';
import useInvitation from './useInvitation';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function Invitation() {
  const {
    fetchInvitations, invitations,
  } = useInvitation();

  useEffect(() => {
    fetchInvitations();
  }, []);

  return (
    <Grid container>

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
