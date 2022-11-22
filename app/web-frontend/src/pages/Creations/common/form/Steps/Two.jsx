import {
  Button, Grid, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import InviteIcon from 'assets/images/invite-icon.png';
import MaterialCard from 'components/cards/MaterialCard';
import Input from 'components/uicore/Input';
import Select from 'components/uicore/Select';
import Form from 'components/uicore/Form';
import { stepTwoValidation } from './validation';

function NewMaterial({ material, onRemoveMaterial, onUpdate = () => {} }) {
  const [editMode, setEditMode] = useState(false);

  const handleUpdate = (values) => {
    if (onUpdate) onUpdate(values);
    setEditMode(false);
  };

  return (
    !editMode ? (
      <MaterialCard
        key={material}
        title={material.title}
        link={material.link}
        mediaUrl={material.link}
        username={material.author}
        interactionBtns
        onDeleteClick={onRemoveMaterial}
        canAccept={false}
        canDecline={false}
        canHide={false}
        onEditClick={() => setEditMode(true)}
        requestAccepted={false}
      />
    ) : (
      <Form
        onSubmit={handleUpdate}
        validationSchema={stepTwoValidation}
        initialValues={{
          title: material.title,
          fileType: material.fileType,
          link: material.link,
          author: material.author,
        }}
      >
        <Grid
          container
          className="create-collection"
          bgcolor="rgba(255, 255, 255, 0.28)"
          border="2px dashed #F78F8A"
        >
          <Grid md={2} xs={12} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Title</Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Input placeholder="Material title" name="title" hookToForm />
          </Grid>

          <Grid
            md={2}
            xs={12}
            marginTop={{ xs: '12px', md: '0px' }}
            paddingLeft={{ md: '24px' }}
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Typography className="heading">File type</Typography>
          </Grid>
          <Grid xs={12} md={4}>
            <Select
              placeholder="Select File Type"
              name="fileType"
              hookToForm
              options={[
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Video' },
                { value: 'audio', label: 'Sound' },
                { value: 'document', label: 'Document' },
              ]}
            />
          </Grid>

          <Grid
            xs={12}
            md={2}
            marginTop={{ xs: '12px', md: '18px' }}
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Typography className="heading">Link</Typography>
          </Grid>
          <Grid
            xs={12}
            md={10}
            marginTop={{ xs: '0px', md: '18px' }}
            display="flex"
            gap="8px"
            alignItems="center"
          >
            <Input
              placeholder="The link where this material is published (
            Google drive, Youtube, etc)"
              name="link"
              hookToForm
            />
          </Grid>

          <Grid
            xs={12}
            md={2}
            marginTop={{ xs: '12px', md: '18px' }}
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Typography className="heading">Author</Typography>
          </Grid>
          <Grid
            xs={12}
            md={10}
            marginTop={{ xs: '0px', md: '18px' }}
            display="flex"
            gap="8px"
            alignItems="center"
          >
            <Input placeholder="Select an author or add a new author name" name="author" hookToForm />
            <Button
              className="inviteButton"
              style={{
                width: 'fit-content',
                paddingLeft: '24px',
                paddingRight: '24px',
              }}
            >
              <img width={17} style={{ marginRight: '10px' }} alt="invite-icon" src={InviteIcon} />
              {' '}
              New author
            </Button>
          </Grid>

          <Grid
            xs={12}
            md={2}
            marginTop={{ xs: '12px', md: '18px' }}
            display="flex"
            flexDirection="row"
            alignItems="center"
          />
          <Grid
            xs={12}
            md={10}
            marginLeft="-20px"
            marginTop={{ xs: '0px', md: '18px' }}
            display="flex"
            alignItems="center"
          >
            <Button
              className="inviteButton"
              style={{
                width: 'fit-content', paddingLeft: '48px', paddingRight: '48px',
              }}
              type="button"
              onClick={() => setEditMode(false)}
            >
              Cancel Edit
            </Button>
            <Button
              className="inviteButton"
              style={{
                width: 'fit-content', paddingLeft: '48px', paddingRight: '48px',
              }}
              type="submit"
            >
              Update File
            </Button>
          </Grid>
        </Grid>
      </Form>
    )
  );
}

export default function StepTwo({
  onComplete = () => {},
  onBack = () => {},
  initialMaterials = [],
  authorSuggestions = [],
  onAuthorInputChange = () => {},
}) {
  const [formKey, setFormKey] = useState(new Date().toISOString());
  const [materials, setMaterials] = useState(initialMaterials);

  const handleValues = (values) => {
    setMaterials([...materials, values]);

    setFormKey(new Date().toISOString());
  };

  const handleSkipClick = () => {
    onComplete(
      initialMaterials.length > 0
        ? (materials.length < initialMaterials.length ? materials : initialMaterials)
        : null,
    );
  };

  const handleNextClick = () => {
    // if no materials then submit the form
    if (materials.length === 0) document.getElementById('material-form-submit').click();

    // if any material then complete the submission
    if (materials.length > 0) onComplete(materials);
  };

  const removeMaterial = (index) => {
    const newMaterials = [...materials];

    newMaterials.splice(index, 1);

    setMaterials(newMaterials);
  };

  const updateMaterial = (index, newData) => {
    const newMaterials = [...materials];

    newMaterials.splice(index, 1, newData);

    setMaterials(newMaterials);
  };

  return (
    <>
      <Grid item xs={12} display="flex" flexDirection="column" gap="24px">
        <Form
          key={formKey}
          onSubmit={handleValues}
          validationSchema={stepTwoValidation}
          initialValues={{
            title: '',
            fileType: '',
            link: '',
            author: '',
          }}
        >
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
                  { value: 'image', label: 'Image' },
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
              <Input onChange={onAuthorInputChange} autoComplete autoCompleteOptions={authorSuggestions.map((x) => x.user_name) || []} placeholder="Select an author or add a new author name" name="author" hookToForm />
              <Button className="inviteButton" style={{ width: 'fit-content', paddingLeft: '24px', paddingRight: '24px' }}>
                <img width={17} style={{ marginRight: '10px' }} alt="invite-icon" src={InviteIcon} />
                {' '}
                New author
              </Button>
            </Grid>

            <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
            <Grid xs={12} md={10} marginLeft="-20px" marginTop={{ xs: '0px', md: '18px' }} display="flex" alignItems="center">
              <Button
                id="material-form-submit"
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
        </Form>

        {materials.map((material, index) => (
          <NewMaterial
            material={material}
            onRemoveMaterial={() => removeMaterial(index)}
            onUpdate={(newData) => updateMaterial(index, newData)}
          />
        ))}
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button className="backCollectionButton" onClick={onBack}>Back</Button>
        <Button className="backCollectionButton" style={{ marginLeft: 'auto', marginRight: '12px' }} onClick={handleSkipClick}>Skip</Button>
        <Button type="submit" className="nextCollectionButton" onClick={handleNextClick}>Next</Button>
      </Grid>
    </>
  );
}
