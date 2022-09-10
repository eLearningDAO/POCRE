import { Button, Grid, TextField, Typography } from '@mui/material';
import React from 'react';
import StepOne from './StepOne';
import StepThree from './StepThree';
import StepTwo from './StepTwo';

const CreateCollection = () => {

  const [step, setStep] = React.useState(1); 
  
  const next = () => {
    if (step !== 3) {
        setStep(step+1);
    }
  }

  const back = () => {
    if (step !== 1) {
        setStep(step-1);
    }
  }

  return ( 
    <Grid container>
      <Grid item xs={12}>
        <Typography className='inviationHeaderTitle' variant='h6'>New Collection - Step 0{`${step}`}</Typography>
      </Grid>

      {step === 1 && (
        <StepOne />
      )}

      {step === 2 && (
        <StepTwo />
      )}

      {step === 3 && (
        <StepThree />
      )}

      <Grid item xs={12} className='collectionButtons'>
        <Button onClick={back} className='backCollectionButton'>Back</Button>
        <Button onClick={next} className='nextCollectionButton'>Next</Button>
      </Grid>
    </Grid>
  );
}
 
export default CreateCollection;