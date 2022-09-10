import { Grid, Typography } from '@mui/material';
import React from 'react';
import InvitationCard from './InvitationCard';

const Invitation = () => {
  return ( 
    <Grid container>

      <Grid item xs={12}>
        <Typography className='inviationHeaderTitle' variant='h6'>Invitation</Typography>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '10px' }}>
        <Typography className='inviationSectionTitle' variant='h6'>Inbox</Typography>
      </Grid>


      {[1, 2, 3].map(i => {
        return (
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <InvitationCard />
          </Grid>
        );
      })}

      <Grid item xs={12} className='invitationSentSection'>
        <Typography className='inviationSectionTitle' variant='h6'>Sent</Typography>
      </Grid>


      {[1].map(i => {
        return (
          <Grid item xs={12} style={{ marginTop: '10px' }}>
            <InvitationCard />
          </Grid>
        );
      })}

    </Grid>
  );
}
 
export default Invitation;