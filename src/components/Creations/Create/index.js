import { Button, Grid, Typography } from '@mui/material';
import React from 'react';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import StepThree from './Steps/Three';
import './index.css';

function CreateCollection() {
  const [step, setStep] = React.useState(1);

  const next = () => {
    if (step !== 3) {
      setStep(step + 1);
    }
  };

  const back = () => {
    if (step !== 1) {
      setStep(step - 1);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          New Creation - Step 
          {`${step}`} of 3
        </Typography>
      </Grid>

      {step === 1 && <StepOne />}
      {step === 2 && <StepTwo />}
      {step === 3 && <StepThree />}

      <Grid item xs={12} className="collectionButtons">
        {step > 1 && <Button onClick={back} className="backCollectionButton">Back</Button>}
        {step < 3 && <Button onClick={next} className="nextCollectionButton">Next</Button>}
      </Grid>
    </Grid>
  );
}

export default CreateCollection;
