import { Grid, Typography } from '@mui/material';
import './index.css';
import StepOne from './Steps/One';
import useLitigationForm from './useLitigationForm';

function LitigationForm() {
  const {
    authorSuggestions,
    handleAuthorInputChange,
    creationSuggestions,
    handleCreationInputChange,
    makeNewLitigation,
    newLitigationStatus,
    isCreatingLitigation,
    getMaterialDetail,
  } = useLitigationForm();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} padding={{ xs: '12px', md: '0' }}>
        <Typography className="heading h4" variant="h4">
          Claim authorship of your creation
        </Typography>
      </Grid>

      <StepOne
        onComplete={async (values) => await makeNewLitigation({ ...values })}
        authorSuggestions={authorSuggestions}
        onAuthorInputChange={handleAuthorInputChange}
        creationSuggestions={creationSuggestions}
        onCreationInputChange={handleCreationInputChange}
        getMaterialDetail={getMaterialDetail}
        status={newLitigationStatus}
        creatingLitigation={isCreatingLitigation}
      />
    </Grid>
  );
}

export default LitigationForm;
