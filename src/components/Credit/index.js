import { Grid, Typography } from '@mui/material';
import React from 'react';
import CreditCard from './CreditCard';
import OtherContributerCard from './OtherContributerCard';

const Credit = () => {
  return ( 
    <Grid container spacing={2}>

        <Grid item md={9} xs={12} className='topContributor'>
            <Grid item md={12}>
                <Typography className='inviationHeaderTitle' variant='h6'>Top Contributors</Typography>
            </Grid>

            <Grid item md={12} className='topContributorSection'>
                <CreditCard name='John' role='e-learner Developer' bio='A junior web developer' />
                <CreditCard name='Jacob' role='e-learner Developer' bio='A junior web developer' />
                <CreditCard name='Peter' role='e-learner Developer' bio='A junior researcher developer' />
                <CreditCard name='Eddy' role='e-learner Researcher' bio='A senior researcher' />
            </Grid>
        </Grid>

        <Grid item md={3} xs={12}>
            <Grid item md={12}>
                <Typography className='inviationHeaderTitle' variant='h6'>Others Contributors</Typography>
            </Grid>

            <Grid item md={12}  className='otherContributorSection'>
            <OtherContributerCard name='John Wick' roles='Programmer, Architect, Developer'/>
            <OtherContributerCard name='James Bond' roles='Writer, Architect, Developer'/>
            <OtherContributerCard name='Adi Nate' roles='UI Designer, Architect, Developer'/>
            <OtherContributerCard name='Peter Parker' roles='Photographer, Architect, Developer'/>
            </Grid>
        </Grid>
    </Grid>
  );
}
 
export default Credit;
