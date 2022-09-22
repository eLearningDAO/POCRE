import { Button, Grid, Typography } from '@mui/material';
import React from 'react';
import StepOne from './Steps/One';
import './index.css';

function CreateLitigation() {
  const step = 1;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          New Litigation - Step 0
          {`${step}`}
        </Typography>
      </Grid>

      {step === 1 && <StepOne />}

      <Grid item xs={12} className="collectionButtons">
        <Button className="nextCollectionButton">Next</Button>
      </Grid>
    </Grid>
  );
}

export default CreateLitigation;
