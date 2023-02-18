import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import Loader from 'components/uicore/Loader';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import StepThree from './Steps/Three';
import './index.css';
import useCreationForm from './useCreationForm';

const stepInfo = [
  'What, when and where it is',
  'What other materials you used and from who',
  'Generate the proof of authorship',
];

function CreationForm({ id = null, activeStep = null, onCreationFetch = () => {} }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [creationDraft, setCreationDraft] = useState();
  const {
    makeCreation,
    newCreationStatus,
    loading,
    updateCreation,
    updateCreationStatus,
    fetchCreationStatus,
    isUpdatingCreation,
    isFetchingCreation,
    tagSuggestions,
    handleTagInputChange,
    getCreationDetails,
    transformedCreation,
    authorSuggestions,
    handleAuthorInputChange,
    resetCreationUpdate,
  } = useCreationForm({ onCreationFetch });

  useEffect(() => {
    if (id) setCreationDraft(transformedCreation);
  }, [transformedCreation]);

  useEffect(() => {
    if (id) getCreationDetails(id);
  }, [id]);

  useEffect(() => {
    if (id && [1, 2, 3].includes(activeStep)) {
      setStep(activeStep);
    }
  }, [id, activeStep]);

  const handleValues = async (values) => {
    if (step === 1) {
      // create creation
      if (!id) {
        await makeCreation({ ...values, is_draft: true }); // this redirects to update creation page
        return;
      }

      // update creation
      const draft = { ...creationDraft, ...values };
      setCreationDraft(draft);
      await updateCreation({ ...draft, is_draft: true });
    }

    if (step === 2) {
      const draft = {
        ...creationDraft,
        materials: values,
      };
      setCreationDraft(draft);
      await updateCreation({ ...draft, is_draft: true });
    }

    if (step === 3 && id) {
      await updateCreation({ ...creationDraft, is_draft: values.is_draft });
    }

    if (step !== 3) {
      setStep(step + 1);
      if (id) resetCreationUpdate();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  if (id && isFetchingCreation) return <Loader />;

  if (id && fetchCreationStatus.error) {
    return (
      <div className="creation-not-found">
        <h4 className="heading h4">{fetchCreationStatus.error}</h4>
        <Button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    (id && !creationDraft ? null : (
      <Grid container spacing={2}>
        <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
          <Typography className="heading h4" variant="h4">
            {id ? 'Update' : 'New'}
            {' '}
            Creation - Step
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
            status={id ? updateCreationStatus : newCreationStatus}
            loading={id ? isUpdatingCreation : loading}
          />
        )}
        {step === 2 && (
          <StepTwo
            onBack={handleBack}
            onComplete={handleValues}
            initialMaterials={creationDraft?.materials || []}
            // eslint-disable-next-line max-len
            authorSuggestions={authorSuggestions}
            onAuthorInputChange={handleAuthorInputChange}
            status={updateCreationStatus}
            loading={isUpdatingCreation}
          />
        )}
        {step === 3 && (
          <StepThree
            creationId={id}
            onBack={handleBack}
            onComplete={handleValues}
            status={id ? updateCreationStatus : newCreationStatus}
            loading={id ? isUpdatingCreation : loading}
            creationDraft={creationDraft}
          />
        )}
      </Grid>
    ))
  );
}

export default CreationForm;
