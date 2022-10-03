import React from 'react';
import {
  Grid, Typography, Button, Box,
} from '@mui/material';
import Form from '../../../uicore/Form';
import Input from '../../../uicore/Input';
import { stepOneValidation } from './validation';

export default function StepOne({
  onComplete = () => {},
  initialValues = {},
  authorSuggestions = [],
  creationSuggestions = [],
  onAuthorInputChange = () => {},
  onCreationInputChange = () => {},
  error = null,
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
            <Input
              variant="dark"
              placeholder="The title of the creation you are claiming"
              name="title"
              hookToForm
            />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="flex-start">
            <Typography className="heading" marginTop="8px">Description</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input
              multiline
              variant="dark"
              name="description"
              placeholder="Describe the creation you are claiming"
              hookToForm
            />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Creation</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input
              variant="dark"
              placeholder="Select the creation with authorship infringement"
              name="creation"
              hookToForm
              onChange={onCreationInputChange}
              autoComplete
              autoCompleteOptions={creationSuggestions.map((x) => x.creation_title) || []}
            />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Author</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Input
              variant="dark"
              placeholder="Select an author"
              name="author"
              hookToForm
              onChange={onAuthorInputChange}
              autoComplete
              autoCompleteOptions={authorSuggestions.map((x) => x.user_name) || []}
            />
          </Grid>

          <Grid md={2} xs={12} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Public Date</Typography>
          </Grid>
          <Grid xs={12} md={4} marginTop={{ xs: '12px', md: '18px' }}>
            <Input
              type="date"
              variant="dark"
              placeholder="Creation Date"
              name="publicDate"
              hookToForm
            />
          </Grid>

          <Grid
            md={2}
            xs={12}
            marginTop={{ xs: '12px', md: '18px' }}
            paddingLeft={{ md: '24px' }}
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Typography className="heading">End Date</Typography>
          </Grid>
          <Grid xs={12} md={4} marginTop={{ xs: '12px', md: '18px' }}>
            <Input
              type="date"
              variant="dark"
              placeholder="Creation Date"
              name="endDate"
              hookToForm
            />
          </Grid>

          {error && (
            <>
              <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
                .
              </Grid>
              <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
                <Box width="100%" className="bg-red color-white" padding="16px" borderRadius="12px" fontSize="16px">
                  {error}
                </Box>
              </Grid>
            </>
          )}
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
