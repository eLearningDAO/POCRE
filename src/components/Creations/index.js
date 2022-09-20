import {
  Button, Grid, TextField, Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
// import LearnHowToImage from '../../assets/learnhowto.png';
import CollectionCard from './CollectionCard/CollectionCard';
import './index.css';

function Creations() {
  const navigate = useNavigate();

  const add = () => {
    navigate('/creations/create');
  };

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
        <Typography className="heading h4" variant="h4">My Creations</Typography>
        <Grid gap={{ sm: '8px' }} display="flex" height="fit-content" flexDirection="row">
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
              padding: 0,
            }}
            fullWidth
            className="input search-bar"
            placeholder="Search"
            id="fullWidth"
          />
          <Button onClick={add} className="btn btn-primary">+ Add New</Button>
        </Grid>
      </Grid>

      <Grid
        xs={12}
        item
        display="flex"
        flexDirection={{ xs: 'row', md: 'column' }}
        overflow={{ xs: 'scroll', md: 'initial' }}
        bgcolor="transparent"
        gap={{ xs: '16px' }}
        className="hidden-scrollbar"
        padding={{ xs: '12px', md: '0' }}
      >
        {[1, 2, 3, 4, 5].map(() => <CollectionCard interactionBtns />)}
      </Grid>

    </Grid>
  );
}

export default Creations;
