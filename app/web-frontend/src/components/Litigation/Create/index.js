import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import './index.css';
import useCreate from './useCreate';

function CreateLitigation() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const {
    newLitigation,
    authorSuggestions,
    handleAuthorInputChange,
    creationSuggestions,
    handleCreationInputChange,
    makeNewLitigation,
    newLitigationStatus,
    isCreatingLitigation,
    getMaterialDetail,
  } = useCreate();

  useEffect(() => {
    if (newLitigation) {
      setStep(2);
    }
  }, [newLitigation]);

  const handleValues = async (values) => {
    if (step === 1) {
      await makeNewLitigation({ ...values });
    }

    if (step === 2) {
      navigate('/litigation/dashboard');
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          Claim authorship of your creation - Step 0
          {`${step}`}
        </Typography>
      </Grid>

      {step === 1 && (
      <StepOne
        onComplete={handleValues}
        authorSuggestions={authorSuggestions}
        onAuthorInputChange={handleAuthorInputChange}
        creationSuggestions={creationSuggestions}
        onCreationInputChange={handleCreationInputChange}
        getMaterialDetail={getMaterialDetail}
        status={newLitigationStatus}
        creatingLitigation={isCreatingLitigation}
      />
      )}
      {step === 2 && (
      <StepTwo
        onComplete={handleValues}
        status={newLitigationStatus}
        loading={isCreatingLitigation}
        invitations={newLitigation?.invitations || []}
      />
      )}
    </Grid>
  );
}

export default CreateLitigation;
