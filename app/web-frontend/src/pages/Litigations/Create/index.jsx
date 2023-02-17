import { Grid, Typography } from '@mui/material';
import './index.css';
import { useParams } from 'react-router-dom';
import StepOne from './Steps/One';
import useCreate from './useCreate';

function CreateLitigation() {
  const {
    authorSuggestions,
    handleAuthorInputChange,
    creationSuggestions,
    handleCreationInputChange,
    makeNewLitigation,
    newLitigationStatus,
    isCreatingLitigation,
    getMaterialDetail,
  } = useCreate();
  const { creationId, materialName } = useParams();
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
        parameterCreationId={creationId}
        parameterMaterialName={materialName}
        creatingLitigation={isCreatingLitigation}
      />
    </Grid>
  );
}

export default CreateLitigation;
