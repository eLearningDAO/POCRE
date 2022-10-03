import { Grid, Typography } from "@mui/material";
import React, { useState } from "react";
import "./index.css";
import StepOne from "./Steps/One";
import StepTwo from "./Steps/Two";
import useCreate from "./useCreate";

function CreateLitigation() {
  const [step, setStep] = useState(1);
  const [litigationDraft, setLitigationDraft] = useState({});
  const [invalidAuthorOrCreationError, setInvalidAuthorOrCreationError] =
    useState(null);

  const {
    authorSuggestions,
    handleAuthorInputChange,
    creationSuggestions,
    handleCreationInputChange,
    makeNewLitigation,
    newLitigationStatus,
    isCreatingLitigation,
  } = useCreate();

  const handleValues = async (values) => {
    if (step === 1) {
      // check if creation title is valid
      const isValidCreation = creationSuggestions.find(
        (x) => x.creation_title === values.creation.trim(),
      );
      if (!isValidCreation) {
        setInvalidAuthorOrCreationError(
          "Invalid creation selected, please select one from the suggested list",
        );
        return;
      }

      // check if author name is valid
      const isValidAuthor = authorSuggestions.find(
        (x) => x.user_name === values.author.trim(),
      );
      if (!isValidAuthor) {
        setInvalidAuthorOrCreationError(
          "Invalid author selected, please select one from the suggested list",
        );
        return;
      }

      setInvalidAuthorOrCreationError(null);
      setLitigationDraft({
        ...values,
        materials: litigationDraft?.materials || null,
      });
    }

    if (step === 2) {
      await makeNewLitigation({ ...litigationDraft, ...values });
    }

    if (step !== 2) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: "12px", md: "0" }}>
        <Typography className="heading h4" variant="h4">
          Claim authorship of your creation - Step 0{`${step}`}
        </Typography>
      </Grid>

      {step === 1 && (
        <StepOne
          onComplete={handleValues}
          authorSuggestions={authorSuggestions}
          onAuthorInputChange={handleAuthorInputChange}
          creationSuggestions={creationSuggestions}
          onCreationInputChange={handleCreationInputChange}
          error={invalidAuthorOrCreationError}
          initialValues={{
            ...(litigationDraft?.title && { title: litigationDraft.title }),
            ...(litigationDraft?.description && {
              description: litigationDraft.description,
            }),
            ...(litigationDraft?.creation && {
              creation: litigationDraft.creation,
            }),
            ...(litigationDraft?.author && { author: litigationDraft.author }),
            ...(litigationDraft?.publicDate && {
              publicDate: litigationDraft.publicDate,
            }),
            ...(litigationDraft?.endDate && {
              endDate: litigationDraft.endDate,
            }),
          }}
        />
      )}
      {step === 2 && (
        <StepTwo
          onBack={handleBack}
          onComplete={handleValues}
          status={newLitigationStatus}
          loading={isCreatingLitigation}
        />
      )}
    </Grid>
  );
}

export default CreateLitigation;
