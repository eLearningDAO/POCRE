import {
  Button, Grid, TextField, Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CollectionCard from './CollectionCard/CollectionCard';
import './index.css';
import useCreations from './useCreations';

function Creations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const { fetchCreations, creations, loading } = useCreations();

  const add = () => {
    navigate('/creations/create');
  };

  useEffect(() => {
    fetchCreations();
  }, []);

  const handleSearch = (event) => {
    setSearch(event.target.value.trim());
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
            onChange={handleSearch}
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
          {creations?.results?.map((x, index) => (
            ((x.creation_title || '') + (x.creation_description || ''))
              ?.toLowerCase()?.includes(search?.toLowerCase()) && (
              <CollectionCard
                key={index}
                title={x?.creation_title}
                description={x?.creation_description}
                creationDate={moment(x?.creation_date).format('Do MMMM YYYY')}
                interactionBtns
                mediaUrl={x?.source?.site_url}
                materials={x.materials}
              />
            )
          ))}
          {creations?.total_results < creations?.results?.length && (
          <Button style={{ margin: 'auto' }} className="nextCollectionButton" onClick={fetchCreations}>
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
