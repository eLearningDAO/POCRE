import React from 'react';
import { Button, Grid, Typography } from '@mui/material';
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
                {[1, 2, 3, 4, 5, 6, 7, 8, ].map((singleCredit) => {
                    return (
                        <CreditCard />
                    );
                })}
            </Grid>
        </Grid>

        <Grid item md={3} xs={12}>
            <Grid item md={12}>
                <Typography className='inviationHeaderTitle' variant='h6'>Others Contributors</Typography>
            </Grid>

            <Grid item md={12}  className='otherContributorSection'>
                {[1, 2, 3, 4, 5, 6, 7, 8, ].map((singleCredit) => {
                    return (
                        <OtherContributerCard />
                    );
                })}
            </Grid>
        </Grid>
    </Grid>
  );
}
 
export default Credit;