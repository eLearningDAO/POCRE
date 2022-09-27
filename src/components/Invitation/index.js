import { Grid, Typography } from '@mui/material';
import React from 'react';
import InvitationCard from './InvitationCard';

function Invitation() {
  return (
    <Grid container>

      <Grid item xs={12}>
        <Typography className="inviationHeaderTitle" variant="h6">Where I am recognized as a co-creator</Typography>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '10px' }}>
        <Typography className="inviationSectionTitle" variant="h6">Inbox</Typography>
      </Grid>

      {[1, 2, 3].map(() => (
        <Grid item xs={12} style={{ marginTop: '10px' }}>
          <InvitationCard />
        </Grid>
      ))}

      <Grid item xs={12} className="invitationSentSection">
        <Typography className="inviationSectionTitle" variant="h6">Sent</Typography>
      </Grid>

    </Grid>
  );
}

export default Invitation;
