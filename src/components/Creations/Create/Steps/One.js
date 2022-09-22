import React from 'react';
import {
  Grid,
  Typography,
  Button,
  Box,
} from '@mui/material';
import Input from '../../../uicore/Input';
import Form from '../../../uicore/Form';
import TagInput from '../../../uicore/TagInput';
import { stepOneValidation } from './validation';

export default function StepOne({
  initialValues = {}, onComplete = () => {}, status = {}, loading = false,
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
            <Typography className="heading">Tag</Typography>
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            <TagInput variant="dark" placeholder="The tags representing your creation" name="tags" hookToForm />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            {(status.error || status.success)
            && (
            <Box width="100%" className={`${status.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px">
              {status.success ? 'Success! A new creation was made' : status.error}
            </Box>
            )}
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button disabled={loading} type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {!loading ? 'Next'
            : <div className="loader" />}
        </Button>
      </Grid>
    </Form>
  );
}
