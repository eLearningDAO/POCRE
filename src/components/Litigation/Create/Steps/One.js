import React from 'react';
import {
  Grid, TextField, Typography, MenuItem, FormControl, Select,
} from '@mui/material';

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
            placeholder="Creation title"
          />
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="flex-start">
          <Typography className="heading" marginTop="8px">Description</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            multiline
            minRows={5}
            className="input input-dark"
            fullWidth
            placeholder="Creation description"
          />
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Creation</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <FormControl fullWidth variant="standard" style={{ minWidth: '220px' }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              style={{ border: 'none' }}
              SelectDisplayProps={{
                style: { border: 'none' },
              }}
              disableUnderline
              value=""
              displayEmpty
              className="select select-dark"
            >
              <MenuItem value="">
                Select a creation
              </MenuItem>
              {
              ['How to do X', 'Creating your own Y', 'Working with Z'].map((x) => (
                <MenuItem value={x}>
                  {x}
                </MenuItem>
              ))
            }
            </Select>
          </FormControl>
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Author</Typography>
        </Grid>
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          <FormControl fullWidth variant="standard" style={{ minWidth: '220px' }}>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              style={{ border: 'none' }}
              SelectDisplayProps={{
                style: { border: 'none' },
              }}
              disableUnderline
              value=""
              displayEmpty
              className="select select-dark"
            >
              <MenuItem value="">
                Select an author
              </MenuItem>
              {
              // eslint-disable-next-line sonarjs/no-identical-functions
              ['Rick Smith', 'Armand Kiehn', 'Kelton Prince'].map((x) => (
                <MenuItem value={x}>
                  {x}
                </MenuItem>
              ))
            }
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Grid>
  );
}
