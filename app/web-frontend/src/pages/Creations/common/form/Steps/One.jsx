import {
  Box, Button, Grid, Typography,
} from '@mui/material';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import Loader from 'components/uicore/Loader';
import TagInput from 'components/uicore/TagInput';
import useLinkValidation from './useLinkValidation';
import { stepOneValidation } from './validation';

export default function StepOne({
  initialValues = {},
  onComplete = () => {},
  onTagInputChange = () => {},
  tagSuggestions = [],
}) {
  const { linkError, validateLink, isValidatingLink } = useLinkValidation({ customErrorMessage: 'Invalid creation source link' });

  const onSubmit = async (values) => {
    const response = await validateLink(values.source);
    if (!response) return;

    onComplete(values);
  };

  return (
    <Form
      onSubmit={onSubmit}
      validationSchema={stepOneValidation}
      initialValues={initialValues}
      preventSubmitOnEnter
    >
      <Grid item xs={12}>
        <Grid container className="create-collection">
          <Grid xs={12} md={3} lg={2} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Title</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10}>
            <Input variant="dark" placeholder="The title of your creation" name="title" hookToForm />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Description</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input variant="dark" placeholder="The description of your creation" name="description" hookToForm />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Source</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input variant="dark" placeholder="The link where your creation is published (Google drive, Youtube, etc)" name="source" hookToForm />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Date</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input type="date" variant="dark" placeholder="Creation Date" name="date" hookToForm />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Tag</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <TagInput tagSuggestions={tagSuggestions.map((tag) => tag.tag_name)} onInput={onTagInputChange} variant="dark" placeholder="The tags representing your creation" name="tags" hookToForm />
          </Grid>

          {linkError && (
            <>
              <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
              <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
                <Box width="100%" className="bg-red color-white" padding="16px" borderRadius="12px" fontSize="16px">
                  {linkError}
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto' }}>
          {isValidatingLink ? <Loader /> : 'Next'}
        </Button>
      </Grid>
    </Form>
  );
}
