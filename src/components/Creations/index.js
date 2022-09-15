import { Button, Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import LearnHowToImage from '../../assets/learnhowto.png';
import CollectionCard from './CollectionCard/CollectionCard';
import "./index.css"

const Creations = () => {
  const navigate = useNavigate();

  const add = () => {
    navigate('/creations/create');
  }

  return (
    <Grid container spacing={2}>

      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="fit-content"
        padding={{ xs: '12px', md: '0' }}
      >
        <Typography className='heading h4' variant='h6'>My Collection</Typography>
        <Grid gap={{ sm: "8px" }} display="flex" height="fit-content" flexDirection="row">
          <TextField variant="standard"
            InputProps={{
              disableUnderline: true,
              padding: 0
            }}
            fullWidth
            className='input search-bar' placeholder="Search" id="fullWidth" />
          <Button onClick={add} className='btn btn-primary'>+ Add New</Button>
        </Grid>
      </Grid>

      <Grid xs={12}
        item
        display="flex"
        flexDirection={{ xs: 'row', md: 'column' }}
        overflow={{ xs: 'scroll', md: "initial" }}
        bgcolor="transparent"
        gap={{ xs: '16px' }}
        className="hidden-scrollbar"
        padding={{ xs: '12px', md: '0' }}
      >
        {[1, 2, 3, 4, 5].map(() => <CollectionCard interactionBtns={true} />)}
      </Grid>

      {/* <Grid item xs={12} sm={12} md={9}>
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
          <img src={LearnHowToImage} alt=""/>
        </div>
      </Grid> */}
    </Grid>
  );
}

export default Creations;