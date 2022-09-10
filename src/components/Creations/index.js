import { Box, Button, Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionCard from './CollectionCard';
import LearnHowToImage from '../../assets/learnhowto.png';

const Creations = () => {
  const navigate = useNavigate();

  const add = () => {
    navigate('/scenario-1/create-collection');
  }

  return ( 
    <Grid container spacing={2}>
      
      <Grid item xs={12} className='collectionTitleBox'>
        <Typography className='inviationHeaderTitle' variant='h6'>My Collection</Typography>
        <div className='collectionTitleBoxButton'>
          <TextField variant="standard"
            InputProps={{
              disableUnderline: true,
              style: { padding: '8px 17px', color: '#32363C' },
            }}
            className='searchBarCollection' fullWidth placeholder="Search" id="fullWidth" />
          <Button onClick={add} className='collectionAddNew'>+ Add New</Button>
        </div>
      </Grid>

      {[1, 2, 3].map(i => {
        return (
          <Grid item xs={12} style={{ paddingTop: '10px' }}>
            <CollectionCard interactionBtns={true} />
          </Grid>
        );
      })}

      <Grid item xs={12} sm={12} md={9}>
        <Typography className='inviationHeaderTitle invitationSentSection' variant='h6'>Trending Collections</Typography>

        {[1, 2, 3].map(i => {
          return (
            <Grid item xs={12} style={{ paddingTop: '10px' }}>
              <CollectionCard interactionBtns={false} />
            </Grid>
          );
        })}
      </Grid>

      <Grid item md={3} xs={12} sm={12}>
        <Typography className='inviationHeaderTitle invitationSentSection' variant='h6'>Learn How To</Typography>

        <div className='learnHowToImage'>
          <img src={LearnHowToImage} />
        </div>
      </Grid>
    </Grid>
  );
}
 
export default Creations;