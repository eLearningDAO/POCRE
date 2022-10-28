import { useNavigate, useParams } from 'react-router-dom';
import { Grid, Typography, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import Loader from 'components/uicore/Loader';
import StepOne from './Steps/One';
import StepTwo from './Steps/Two';
import StepThree from './Steps/Three';
import './index.css';
import useUpdate from './useUpdate';

const stepInfo = [
  'What, when and where it is',
  'What other materials you used and from who',
  'Generate the proof of authorship',
];

function CreateCollection() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [creationDraft, setCreationDraft] = useState();
  const {
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
  } = useUpdate();

  useEffect(() => {
    setCreationDraft(transformedCreation);
  }, [transformedCreation]);

  useEffect(() => {
    getCreationDetails(id);
  }, []);

  const handleValues = async (values) => {
    if (step === 1) {
      setCreationDraft({ ...creationDraft, ...values });
    }

    if (step === 2) {
      setCreationDraft({
        ...creationDraft,
        materials: values,
      });
    }

    if (step === 3) {
      await updateCreation({ ...creationDraft, is_draft: false });
    }

    if (step !== 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  if (isFetchingCreation) return <Loader />;

  if (fetchCreationStatus.error) {
    return (
      <div className="creation-not-found">
        <h4 className="heading h4">{fetchCreationStatus.error}</h4>
        <Button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    (!creationDraft ? null : (
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
            authorSuggestions={authorSuggestions}
            onAuthorInputChange={handleAuthorInputChange}
          />
        )}
        {step === 3 && (
          <StepThree
            creationId={id}
            onBack={handleBack}
            onComplete={handleValues}
            status={updateCreationStatus}
            loading={isUpdatingCreation}
            creationDraft={creationDraft}
          />
        )}
      </Grid>
    ))
  );
}

export default CreateCollection;
