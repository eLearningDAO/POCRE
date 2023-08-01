import { Grid, Typography, Button } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import Loader from 'components/uicore/Loader';
import StepOne from './Steps/One';
import useHydraDemoLitigationForm from './useHydraDemoLitigationForm';

function LitigationForm(
  {
    id = null, onLitigationFetch = () => {}, autofillClaim = {},
  },
) {
  const navigate = useNavigate();

  const {
    authorSuggestions,
    handleAuthorInputChange,
    creationSuggestions,
    handleCreationInputChange,
    makeNewLitigation,
    newLitigationStatus,
    isCreatingLitigation,
    getMaterialDetail,
    getLitigationDetails,
    isFetchingLitigation,
    fetchLitigationStatus,
    litigation,
    deleteLitigationStatus,
    isDeletingLitigation,
    deleteLitigation,
    resetDeletionErrors,
  } = useHydraDemoLitigationForm({ onLitigationFetch });

  useEffect(() => {
    if (id) getLitigationDetails(id);
  }, [id]);

  useEffect(() => {
    if (deleteLitigationStatus.success) navigate('/litigations');
  }, [deleteLitigationStatus.success]);

  if (id && isFetchingLitigation) return <Loader />;

  if (id && fetchLitigationStatus.error) {
    return (
      <div className="creation-not-found">
        <h4 className="heading h4">{fetchLitigationStatus.error}</h4>
        <Button className="btn btn-primary" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          Claim authorship of your creation
        </Typography>
      </Grid>

      <StepOne
        onComplete={async (values) => await makeNewLitigation({ ...values })}
        initialValues={{
          title: litigation?.litigation_title,
          description: litigation?.litigation_description,
          creation: litigation?.creation,
        }}
        creationIdToClaim={autofillClaim.creationId}
        materialIdToClaim={autofillClaim.materialId}
        authorSuggestions={authorSuggestions}
        onAuthorInputChange={handleAuthorInputChange}
        creationSuggestions={creationSuggestions}
        onCreationInputChange={handleCreationInputChange}
        getMaterialDetail={getMaterialDetail}
        status={newLitigationStatus}
        creatingLitigation={isCreatingLitigation}
        handleLitigationDraftDelete={deleteLitigation}
        isDeletingDraft={isDeletingLitigation}
        deletionError={deleteLitigationStatus.error}
        resetDeletionErrors={resetDeletionErrors}
        isExistingDraft={litigation?.is_draft}
      />
    </Grid>
  );
}

export default LitigationForm;
