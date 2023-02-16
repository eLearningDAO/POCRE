import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Button } from '@mui/material';
import React, { useState, useEffect } from 'react';
import Loader from 'components/uicore/Loader';
import authUser from 'utils/helpers/authUser';
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

const getAuthorTagSuggesstion = (authorSuggestions, user) => {
  const authorSuggestionsNew = [];
  authorSuggestions.map(
    (author) => {
      if (author.reputation_stars) {
        let authorName = `${author.user_name}${user.user_id === author?.user_id ? ' (You)-' : '-'}`;
        authorName += '★'.repeat(author.reputation_stars);
        authorSuggestionsNew.push(authorName);
      } else {
        const authorName = `${author.user_name}${user.user_id === author?.user_id ? ' (You)' : ''}`;
        authorSuggestionsNew.push(authorName);
      }
      return true;
    },
  );
  return authorSuggestionsNew;
};

function CreationForm({ id = null, onCreationFetch = () => {} }) {
  const navigate = useNavigate();
  const user = authUser.getUser();
  const [step, setStep] = useState(1);
  const [creationDraft, setCreationDraft] = useState();
  const {
    makeNewCreation,
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
  } = useCreationForm({ onCreationFetch });

  useEffect(() => {
    if (id) setCreationDraft(transformedCreation);
  }, [transformedCreation]);

  useEffect(() => {
    if (id) getCreationDetails(id);
  }, [id]);

  const handleValues = async (values) => {
    if (step === 1) {
      if (id) {
        setCreationDraft({ ...creationDraft, ...values });
      } else {
        setCreationDraft({ ...values, materials: creationDraft?.materials || null });
      }
    }

    if (step === 2) {
      setCreationDraft({
        ...creationDraft,
        materials: values,
      });
    }

    if (step === 3) {
      const updatedCreationDraft = creationDraft;
      const updatedMaterials = [];
      updatedCreationDraft.materials.map(
        (material) => {
          const authorWithoutStars = [];
          const temporaryMaterial = material;
          material.author.map(
            (author) => {
              const nameWithouStars = author.split('-')[0];
              authorWithoutStars.push(nameWithouStars);
              return true;
            },
          );
          temporaryMaterial.author = authorWithoutStars;
          updatedMaterials.push(temporaryMaterial);
          return true;
        },
      );
      updatedCreationDraft.materials = updatedMaterials;
      // eslint-disable-next-line max-len
      await (id ? updateCreation({ ...updatedCreationDraft, is_draft: false }) : makeNewCreation({ ...creationDraft, is_draft: !!values?.is_draft }));
    }

    if (step !== 3) {
      setStep(step + 1);
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
          />
        )}
        {step === 2 && (
          <StepTwo
            onBack={handleBack}
            onComplete={handleValues}
            initialMaterials={creationDraft?.materials || []}
            // eslint-disable-next-line max-len
            authorSuggestions={authorSuggestions && getAuthorTagSuggesstion(authorSuggestions, user)}
            onAuthorInputChange={handleAuthorInputChange}
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
