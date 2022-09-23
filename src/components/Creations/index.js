import {
  Button, Grid, TextField, Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import LearnHowToImage from '../../assets/learnhowto.png';
import CollectionCard from './CollectionCard/CollectionCard';
import './index.css';
import useCreations from './useCreations';

function Creations() {
  const navigate = useNavigate();

  const { fetchCreations, creations, loading } = useCreations();

  const add = () => {
    navigate('/creations/create');
  };

  useEffect(() => {
    fetchCreations();
  }, []);

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

      {loading ? <div style={{ margin: 'auto' }} className="loader" /> : (creations?.results?.length > 0 ? (
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
          {creations?.results?.map((x) => (
            <CollectionCard
              title={x?.creation_title}
              description={x?.creation_description}
              creationDate={x?.creation_date}
              interactionBtns
              materials={x.materials}
            />
          ))}
          {creations?.total_results < creations?.results?.length && (
          <Button style={{ margin: 'auto' }} className="nextCollectionButton">
            Load More
          </Button>
          )}
        </Grid>
      ) : (
        <h4 className="heading h4 result-msg">
          No Creations Found
        </h4>
      )
      )}
    </Grid>
  );
}

export default Creations;
