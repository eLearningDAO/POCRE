import {
  Button, Grid, Typography, Box,
} from '@mui/material';
import React from 'react';
import UserCard from '../../cards/UserCard';
import LitigationCard from '../../cards/LitigationCard';
import LikeIcon from '../../../assets/svgs/like.svg';
import DislikeIcon from '../../../assets/svgs/dislike.svg';
import ThumbPinIcon from '../../../assets/svgs/thumb-pin.svg';
import './index.css';

export default function LitigationClosed() {
  return (
    <Grid item xs={12}>
      <Grid item xs={12}>
        <Typography className="litigationCloseTitle" variant="h6">Litigation- I want to reclaim my authorship of this media</Typography>
      </Grid>

      <Grid display="flex" alignItem="flex-top" gap="24px" padding="36px" className="secondary-section-container">
        <Grid display="flex" width="100%" flexDirection="column" gap="12px">
          <Typography className="inviationSectionTitle" variant="h6">Claimer</Typography>
          <UserCard />
        </Grid>
        <Grid display="flex" width="100%" flexDirection="column" gap="12px">
          <Typography className="inviationSectionTitle" variant="h6">Claimer</Typography>
          <UserCard variant="secondary" />
        </Grid>
      </Grid>

      <Grid display="flex" marginTop="36px" width="100%">
        <LitigationCard />
      </Grid>
      <Grid display="flex" gap="48px" marginTop="24px" alignItems="center" justifyContent="flex-end" className="litigation-vote-container">
        <Box display="flex" gap="4px" alignItems="center">
          <img src={LikeIcon} alt="" style={{ marginRight: '8px' }} />
          Agree
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <img src={DislikeIcon} alt="" style={{ marginRight: '8px' }} />
          Opposition
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <img src={ThumbPinIcon} alt="" style={{ marginRight: '8px' }} />
          Impartial
        </Box>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '40px' }}>
        <Typography className="litigationCloseTitle" variant="h6">New Creation - Step 02</Typography>
      </Grid>

      <Grid display="flex" flexDirection="column" justifyContent="center" alignItem="center" gap="24px" padding="36px" className="secondary-section-container">
        <Grid display="flex" alignItem="flex-top" gap="24px">
          <UserCard />
          <UserCard variant="secondary" totalCreationsAuthored={1} />
        </Grid>
        <Button className="btn btn-primary-outlined" style={{ margin: 'auto' }}>See More</Button>
      </Grid>
    </Grid>
  );
}
