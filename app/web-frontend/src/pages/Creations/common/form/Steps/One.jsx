import {
  Button, Grid,
  Typography,
} from '@mui/material';
import React from 'react';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import TagInput from 'components/uicore/TagInput';
import { stepOneValidation } from './validation';

export default function StepOne({
  initialValues = {},
  onComplete = () => {},
  onTagInputChange = () => {},
  tagSuggestions = [],
}) {
  return (
    <Form
      onSubmit={onComplete}
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
        </Grid>
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto' }}>
          Next
        </Button>
      </Grid>
    </Form>
  );
}
