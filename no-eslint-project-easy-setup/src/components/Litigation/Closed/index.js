import {
  Button, Grid, Typography, Box,
} from '@mui/material';
import React, { useState } from 'react';
import UserCard from '../../cards/UserCard';
import LitigationCard from '../../cards/LitigationCard';
import LikeIcon from '../../../assets/svgs/like.svg';
import DislikeIcon from '../../../assets/svgs/dislike.svg';
import ThumbPinIcon from '../../../assets/svgs/thumb-pin.svg';
import './index.css';
import LeftIcon from '../../../assets/left.png';
import RightIcon from '../../../assets/right.png';

export default function LitigationClosed() {
  const [slideNumber, setSlideNumber] = useState(1);

  const next = () => {
    setSlideNumber((x) => x + 1);
  };
  const previous = () => {
    setSlideNumber((x) => x - 1);
  };

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
          4
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <img src={DislikeIcon} alt="" style={{ marginRight: '8px' }} />
          Opposition
          5
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
          <img src={ThumbPinIcon} alt="" style={{ marginRight: '8px' }} />
          Impartial
          1
        </Box>
      </Grid>

      <Grid item xs={12} style={{ marginTop: '40px' }}>
        <Typography className="litigationCloseTitle" variant="h6">New Creation - Step 02</Typography>
      </Grid>

      <Grid display="flex" flexDirection="column" justifyContent="center" alignItem="center" gap="24px" padding="36px" className="secondary-section-container">
        <div className="carousel-container">
          {slideNumber % 2 === 0
            ? (
              <>
                <UserCard username="Rick Smith" imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`} totalCreationsAuthored={10} />
                <UserCard username="Kelton Price" imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`} totalCreationsAuthored={1} />
              </>
            )
            : (
              <>
                <UserCard username="Leone Dach" imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`} totalCreationsAuthored={5} />
                <UserCard username="Jewell Purdy" imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`} totalCreationsAuthored={8} />
              </>
            )}
          <div className="carousel-slide-btns-container">
            <Button onClick={previous}><img src={LeftIcon} alt="" /></Button>
            <Button onClick={next}><img src={RightIcon} alt="" /></Button>
          </div>
        </div>

        <Button className="btn btn-primary-outlined" style={{ margin: 'auto' }}>See More</Button>
      </Grid>
    </Grid>
  );
}
