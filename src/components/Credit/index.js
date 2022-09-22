import { Grid, Typography } from '@mui/material';
import React from 'react';
import CreditCard from './CreditCard';
import OtherContributerCard from './OtherContributerCard';
import Data from './properties.json';

function Credit() {
  return (
    <Grid container spacing={2}>

      <Grid item md={9} xs={12} className="topContributor">
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Top Contributors</Typography>
        </Grid>

        <Grid item md={12} className="topContributorSection">
          {Data.slice(0, 6).map((data) => (
            <CreditCard jobs={data.jobs} name={data.name} bio={data.bio} />
          ))}
        </Grid>
      </Grid>

      <Grid item md={3} xs={12}>
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Others Contributors</Typography>
        </Grid>

        <Grid item md={12} className="otherContributorSection">
          {Data.slice(6, Data.length).map((data2) => (
            <OtherContributerCard name={data2.name} jobs={data2.jobs} />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Credit;
