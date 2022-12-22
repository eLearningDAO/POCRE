import {
  Button, Grid, Typography,
} from '@mui/material';
import InviteIcon from 'assets/images/invite-icon.png';
import MaterialCard from 'components/cards/MaterialCard';
import Modal from 'components/Modal';
import Form from 'components/uicore/Form';
import Input from 'components/uicore/Input';
import Select from 'components/uicore/Select';
import TagInput from 'components/uicore/TagInput';
import { useState } from 'react';
import authUser from 'utils/helpers/authUser';
import { stepTwoAuthorInviteValidation, stepTwoMaterialValidation } from './validation';

function NewMaterial({
  material,
  authorSuggestions = [],
  onUpdate = () => {},
  onRemoveMaterial = () => {},
  onAuthorInputChange = () => {},
}) {
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
        validationSchema={stepTwoMaterialValidation}
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
            <TagInput
              hookToForm
              maxTags={1}
              name="author"
              addTagOnEnter={false}
              onInput={onAuthorInputChange}
              placeholder="Type author name and select from suggestions below"
              tagSuggestions={authorSuggestions.map((x) => x.user_name) || []}
            />
            {/* <Button
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
            </Button> */}
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

function AuthorInviteModal({ onClose = () => {}, onAuthorDetailsSubmit }) {
  const [requiredMethod, setRequiredMethod] = useState(null);

  const onSubmit = (values) => {
    const invitedAuthor = `invite-via-${values?.inviteMethod}${values?.username ? `:${values?.username}` : ''}:${values?.inviteValue}`;
    onAuthorDetailsSubmit(invitedAuthor);
  };

  return (
    <Modal
      title="Invite an author"
      onClose={onClose}
    >
      <Form
        key={requiredMethod}
        onSubmit={onSubmit}
        validationSchema={stepTwoAuthorInviteValidation}
        initialValues={{
          inviteMethod: requiredMethod || '',
        }}
      >
        <Grid container>
          <Grid xs={12} md={2} display="flex" flexDirection="row" alignItems="center" marginTop={{ xs: '12px', md: '18px' }}>
            <Typography className="heading">Invite Method</Typography>
          </Grid>
          <Grid xs={12} md={10} marginTop={{ xs: '12px', md: '18px' }}>
            <Select
              variant="dark"
              placeholder="Select Invite Method"
              name="inviteMethod"
              hookToForm
              options={[
                { value: 'phone', label: 'Phone' },
                { value: 'email', label: 'Email' },
                { value: 'username', label: 'Username' },
              ]}
              onChange={(event) => {
                setRequiredMethod(event?.target?.value?.trim() || null);
              }}
            />
          </Grid>

          <Grid
            md={2}
            xs={12}
            display="flex"
            alignItems="center"
            flexDirection="row"
            marginTop={{ xs: '12px', md: '18px' }}
          >
            <Typography className="heading">
              Name
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={10}
            marginTop={{ xs: '12px', md: '18px' }}
          >
            <Input
              hookToForm
              placeholder={'Enter the author\'s Name'}
              variant="dark"
              name="username"
            />
          </Grid>

          <Grid
            md={2}
            xs={12}
            display="flex"
            alignItems="center"
            flexDirection="row"
            marginTop={{ xs: '12px', md: '18px' }}
            className={!['email', 'phone'].includes(requiredMethod) && 'hidden'}
          >
            <Typography className={`heading ${!['email', 'phone'].includes(requiredMethod) && 'hidden'}`}>
              {requiredMethod === 'email' ? 'Email' : ''}
              {requiredMethod === 'phone' ? 'Phone Number' : ''}
              {!requiredMethod && 'Invite Value'}
            </Typography>
          </Grid>
          <Grid
            xs={12}
            md={10}
            marginTop={{ xs: '12px', md: '18px' }}
            className={!['email', 'phone'].includes(requiredMethod) && 'hidden'}
          >
            <Input
              hookToForm
              placeholder={
                (() => {
                  if (requiredMethod === 'email') return 'Enter the author\'s Email';
                  if (requiredMethod === 'phone') return 'Enter the author\'s Phone';
                  return '';
                })()
              }
              variant="dark"
              name="inviteValue"
            />
          </Grid>

          <Grid item xs={12} className="collectionButtons">
            <Button type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto', marginRight: '12px' }}>Invite</Button>
          </Grid>
        </Grid>
      </Form>
    </Modal>
  );
}

export default function StepTwo({
  onComplete = () => {},
  onBack = () => {},
  initialMaterials = [],
  authorSuggestions = [],
  onAuthorInputChange = () => {},
}) {
  const user = authUser.getUser();
  const [formKey, setFormKey] = useState(new Date().toISOString());
  const [materials, setMaterials] = useState(initialMaterials);
  const [showInviteAuthorDialog, setShowInviteAuthorDialog] = useState(false);
  const [invitedAuthor, setInvitedAuthor] = useState(null);

  const handleValues = (values) => {
    setMaterials([...materials, values]);
    setInvitedAuthor(null);

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
      {showInviteAuthorDialog && (
        <AuthorInviteModal
          onClose={() => setShowInviteAuthorDialog(false)}
          onAuthorDetailsSubmit={(author) => {
            setInvitedAuthor(author);
            setShowInviteAuthorDialog(false);
          }}
        />
      )}
      <Grid item xs={12} display="flex" flexDirection="column" gap="24px">
        <Form
          key={formKey}
          onSubmit={handleValues}
          validationSchema={stepTwoMaterialValidation}
          initialValues={{
            title: '',
            fileType: '',
            link: '',
            author: [],
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
                  { value: 'audio', label: 'Sound' },
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
              <TagInput
                hookToForm
                maxTags={1}
                name="author"
                addTagOnEnter={false}
                onInput={onAuthorInputChange}
                selectedTags={invitedAuthor ? [invitedAuthor] : []}
                placeholder="Type author name and select from suggestions below"
                tagSuggestions={authorSuggestions.map((x) => (`${x.user_name}${user.user_id === x?.user_id ? ' (You)' : ''}`)) || []}
              />
              <Button className="inviteButton" style={{ width: 'fit-content', paddingLeft: '24px', paddingRight: '24px' }} onClick={() => setShowInviteAuthorDialog(true)}>
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
            onAuthorInputChange={onAuthorInputChange}
            authorSuggestions={authorSuggestions}
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
