import { Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import StepThree from './Steps/Three';
import './index.css';
import useCreate from './useCreate';

function CreateCollection() {
  const [step, setStep] = useState(1);
  const [creationDraft, setCreationDraft] = useState();
  const { makeNewCreation, newCreationStatus, loading } = useCreate();

  const handleValues = async (values) => {
    if (step === 1) {
      setCreationDraft(values);
    }

    if (step === 2) {
      setCreationDraft({
        ...creationDraft,
        materials: values,
      });
    }

    if (step === 3) {
      await makeNewCreation(creationDraft);
    }

    if (step !== 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          New Creation - Step 0
          {`${step}`}
        </Typography>
      </Grid>

      {step === 1 && (
      <StepOne
        onComplete={handleValues}
        initialValues={{
          ...(creationDraft?.title && { title: creationDraft.title }),
          ...(creationDraft?.description && { description: creationDraft.description }),
          ...(creationDraft?.source && { source: creationDraft.source }),
          ...(creationDraft?.tags && { tags: creationDraft.tags }),
          ...(creationDraft?.date && { date: creationDraft.date }),
        }}
      />
      )}
      {step === 2 && (
      <StepTwo
        onBack={handleBack}
        onComplete={handleValues}
      />
      )}
      {step === 3 && (
      <StepThree
        onBack={handleBack}
        onComplete={handleValues}
        status={newCreationStatus}
        loading={loading}
      />
      )}
    </Grid>
  );
}

export default CreateCollection;
