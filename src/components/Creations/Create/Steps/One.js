import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

export default function StepOne() {
  return (
    <Grid item xs={12}>
      <Grid container className="create-collection">
        <Grid xs={12} md={3} lg={2} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Title</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="The title of your creation"
          />
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Description</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="The description of your creation"
          />
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Source</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="The link where your creation is published (Google drive, Youtube, etc)"
          />
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Tag</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="The tags representing your creation"
          />
        </Grid>
      </Grid>
    </Grid>
  );
}