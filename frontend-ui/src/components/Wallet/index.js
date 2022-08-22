import { Grid, Button, Chip, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Wallet = () => {
  const navigate = useNavigate();
  
  const handleClickNewCollection = () => {
    navigate('/scenario-1/create-collection');
  };

  const handleClickSeeCollection = () => {
    navigate('/creations');
  };

  return ( 
    <div>
      <div className="inner-div">
        <div className="front">
          <div className="front__bkg-photo"></div>
          <div className="front__face-photo"></div>
            <Grid item className='userDetailsLeft'>
              <div className='userDetailsLeftHeader'>
                <Typography variant='h4'>John Doe</Typography>
                <Typography variant='p'>User experience designer</Typography>
              </div>

              <div className='userDetailsChip'>
                <Chip className='chip' label='Author of 10 Collections' />
                <Chip className='chip' label='120 Followers' />
              </div>
            </Grid>
            <Grid container className='userDetails'>
              <Grid item md={12} spacing={5} className='userDetailsRight'>
                <Button className='collectionButton' onClick={handleClickSeeCollection}>
                  View My Collections
                </Button>

                <Button className='collectionButton2' onClick={handleClickNewCollection}>
                    Create a New Collection
                </Button>
              </Grid>
            </Grid>
        </div>
      </div>
    </div>
   );
}
 
export default Wallet;