import { Grid, Typography } from '@mui/material';
import React from 'react';
import CreditCard from './CreditCard';
import OtherContributerCard from './OtherContributerCard';

function Credit() {
  return (
    <Grid container spacing={2}>

      <Grid item md={9} xs={12} className="topContributor">
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Top Contributors</Typography>
        </Grid>

        <Grid item md={12} className="topContributorSection">
          {[1, 2, 3, 4, 5, 6].map(() => (
            <CreditCard jobs="developer" bio="hello I am a dev" />
          ))}
        </Grid>
      </Grid>

      <Grid item md={3} xs={12}>
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Others Contributors</Typography>
        </Grid>

        <Grid item md={12} className="otherContributorSection">
          {[1, 2, 3, 4].map(() => (
            <OtherContributerCard name="Fizz" jobs="analyst, developer, tester" />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Credit;
