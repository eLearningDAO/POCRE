import { Grid, Typography } from '@mui/material';
import React, { useState } from 'react';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import StepThree from './Steps/Three';
import './index.css';
import useCreate from './useCreate';

const stepInfo = [
  'What, when and where it is',
  'What other materials you used and from who',
  'Generate the proof of authorship',
];

function CreateCollection() {
  const [step, setStep] = useState(1);
  const [creationDraft, setCreationDraft] = useState();
  const {
    makeNewCreation,
    newCreationStatus,
    loading,
    tagSuggestions,
    handleTagInputChange,
  } = useCreate();

  const handleValues = async (values) => {
    if (step === 1) {
      setCreationDraft({ ...values, materials: creationDraft?.materials || null });
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
          New Creation - Step
          {' '}
          {step}
          {' '}
          of 3
          {' - '}
          {stepInfo[step - 1]}
        </Typography>
      </Grid>

      {step === 1 && (
      <StepOne
        onComplete={handleValues}
        onTagInputChange={handleTagInputChange}
        tagSuggestions={tagSuggestions}
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
        initialMaterials={creationDraft.materials || []}
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
