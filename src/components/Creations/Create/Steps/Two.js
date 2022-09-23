import {
  Button, Grid, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import InviteIcon from '../../../../assets/invite-icon.png';
import MaterialCard from '../../../cards/MaterialCard';
import Input from '../../../uicore/Input';
import Select from '../../../uicore/Select';
import Form from '../../../uicore/Form';
import { stepTwoValidation } from './validation';

export default function StepTwo({
  onComplete = () => {},
  onBack = () => {},
}) {
  const [materials, setMaterials] = useState([]);

  const handleValues = (values) => setMaterials([...materials, values]);

  const handleSkipClick = () => onComplete();

  const handleNextClick = () => materials.length > 0 && onComplete(materials);

  const removeMaterial = (index) => {
    const newMaterials = [...materials];

    newMaterials.splice(index, 1);

    setMaterials(newMaterials);
  };

  return (
    <Form
      onSubmit={handleValues}
      validationSchema={stepTwoValidation}
    >
      <Grid item xs={12} display="flex" flexDirection="column" gap="24px">
        <Grid container className="create-collection" bgcolor="rgba(255, 255, 255, 0.28)" border="2px dashed #F78F8A">
          <Grid md={2} xs={12} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Title</Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Input placeholder="Material title" name="title" hookToForm />
          </Grid>

          <Grid md={2} xs={12} marginTop={{ xs: '12px', md: '0px' }} paddingLeft={{ md: '24px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">File type</Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Select
              placeholder="Select File Type"
              name="fileType"
              hookToForm
              options={[
                { value: 'video', label: 'Video' },
                { value: 'sound', label: 'Sound' },
                { value: 'document', label: 'Document' },
              ]}
            />
          </Grid>

          <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Link</Typography>
          </Grid>
          <Grid xs={12} md={10} marginTop={{ xs: '0px', md: '18px' }} display="flex" gap="8px" alignItems="center">
            <Input placeholder="The link where this material is published (Google drive, Youtube, etc)" name="link" hookToForm />
          </Grid>

          <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Author</Typography>
          </Grid>
          <Grid xs={12} md={10} marginTop={{ xs: '0px', md: '18px' }} display="flex" gap="8px" alignItems="center">
            <Input placeholder="Select an author or add a new author name" name="author" hookToForm />
            <Button className="inviteButton" style={{ width: 'fit-content', paddingLeft: '24px', paddingRight: '24px' }}>
              <img width={17} style={{ marginRight: '10px' }} alt="invite-icon" src={InviteIcon} />
              {' '}
              Invite
            </Button>
          </Grid>

          <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
          <Grid xs={12} md={10} marginLeft="-20px" marginTop={{ xs: '0px', md: '18px' }} display="flex" alignItems="center">
            <Button
              className="inviteButton"
              style={{
                width: 'fit-content', paddingLeft: '48px', paddingRight: '48px',
              }}
              type="submit"
            >
              Add File
            </Button>
          </Grid>
        </Grid>

        {materials.map((material, index) => (
          <MaterialCard
            key={material}
            title={material.title}
            link={material.link}
            username={material.author}
            interactionBtns
            onDeleteClick={() => removeMaterial(index)}
            canAccept={false}
            canDecline={false}
            canHide={false}
            requestAccepted={false}
          />
        ))}
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button className="backCollectionButton" onClick={onBack}>Back</Button>
        <Button className="backCollectionButton" style={{ marginLeft: 'auto', marginRight: '12px' }} onClick={handleSkipClick}>Skip</Button>
        <Button type="submit" className="nextCollectionButton" onClick={handleNextClick}>Next</Button>
      </Grid>
    </Form>
  );
}
