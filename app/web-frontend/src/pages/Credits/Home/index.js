import { Grid, Typography } from '@mui/material';
import React from 'react';
import CreditCard from '../../../components/cards/CreditCard';
import OtherContributerCard from '../../../components/cards/OtherContributersCard';
import Data from './properties.json';

function Credit() {
  return (
    <Grid container spacing={2}>

      <Grid item md={9} xs={12} className="topContributor">
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Top Contributors</Typography>
        </Grid>

        <Grid container gap={0} className="topContributorSection">
          <div className="InnerContainer">
            {Data.credits[0].topContributors.slice(0, 6).map((data) => (
              <CreditCard
                job={data.job}
                name={data.name}
                bio={data.bio}
                linkedIn={data.linkedinUrl}
                twitter={data.twitterUrl}
                image={data.avatarUrl}
                github={data.githubUrl}
              />
            ))}
          </div>
        </Grid>
      </Grid>

      <Grid item md={3} xs={12}>
        <Grid item md={12}>
          <Typography className="inviationHeaderTitle" variant="h6">Others Contributors</Typography>
        </Grid>

        <Grid item md={12} className="otherContributorSection">
          {Data.credits[1].otherContributors.map((data2) => (
            <OtherContributerCard
              name={data2.name}
              job={data2.job}
              profileUrl={data2.profileUrl}
              image={data2.avatarUrl}
            />
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

export default Credit;
