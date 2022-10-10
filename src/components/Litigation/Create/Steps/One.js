import React, { useState } from 'react';
import {
  Grid, Typography, Button, Box,
} from '@mui/material';
import Cookies from 'js-cookie';
import Form from '../../../uicore/Form';
import Input from '../../../uicore/Input';
import Loader from '../../../uicore/Loader';
import Select from '../../../uicore/Select';
import { stepOneValidation } from './validation';
import { API_BASE_URL } from '../../../../config';

export default function StepOne({
  onComplete = () => {},
  initialValues = {},
  // authorSuggestions = [],
  creationSuggestions = [],
  // onAuthorInputChange = () => {},
  onCreationInputChange = () => {},
  getMaterialDetail = () => {},
}) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(null);
  const [creationUUIDFromLink, setCreationUUIDFromLink] = useState(null);
  const [creationUUIDDetailsFromLink, setCreationUUIDDetailsFromLink] = useState(null);
  const [creation, setCreation] = useState(null);
  const [materialsDetails, setMaterialsDetails] = useState(null);
  const [author] = useState(null);
  const [creationOrMaterialAuthor, setCreationOrMaterialAuthor] = useState('');

  const onCreationSelect = async (event, value) => {
    setCreation(value?.id);

    // check if material is required for this creation
    const foundCreation = creationSuggestions.find(
      (x) => x.creation_id === value?.id,
    );
    if (foundCreation) {
      if (foundCreation?.materials?.length > 0) {
        const { materials } = foundCreation;
        const response = await Promise.all(materials.map(async (x) => getMaterialDetail(x)));
        setMaterialsDetails(response.filter((x) => x.is_claimable));
      } else {
        // get details of creation author
        const creationAuthor = await fetch(`${API_BASE_URL}/users/${foundCreation.author_id}`).then((x) => x.json());
        setCreationOrMaterialAuthor(creationAuthor);
      }
    } else {
      setMaterialsDetails(null);
    }
  };

  // const onAuthorSelect = (event, value) => {
  //   setAuthor(value?.id);
  // };

  const handleSubmit = async (values) => {
    // check if material is present
    if (materialsDetails?.length > 0 && !values?.material) {
      setError('Invalid material selected, please select one from the suggested list');
      return;
    }

    // check if creation is valid
    if ((creation && creationUUIDFromLink) || (!creation && !creationUUIDFromLink)) {
      setError('Please select either creation title or link.');
      return;
    }
    if (creation && !creationUUIDFromLink) {
      const isValidCreation = creationSuggestions.find(
        (x) => x.creation_id === creation,
      );
      if (!isValidCreation) {
        setError('Invalid creation selected, please select one from the suggested list');
        return;
      }
    }

    // clear error
    setError(null);

    // get involved authors
    const involvedAuthors = await (async () => {
      const temporaryAuthors = [];

      // the one who is creating this litigation
      const authUser = JSON.parse(Cookies.get('activeUser') || '{}');
      temporaryAuthors.push({ name: authUser?.user_name, image: `https://i.pravatar.cc/50?img=${Math.random()}` });

      // the one who is the author of creation
      const creationAuthorId = creationUUIDDetailsFromLink
        ? creationUUIDDetailsFromLink?.author_id
        : creationSuggestions.find(
          (x) => x?.creation_id === creation,
        )?.author_id;
      const creationAuthor = await fetch(`${API_BASE_URL}/users/${creationAuthorId}`).then((x) => x.json());
      temporaryAuthors.push({ name: creationAuthor?.user_name, image: `https://i.pravatar.cc/50?img=${Math.random()}` });

      // the one who is the author of material
      if (materialsDetails) {
        const materialAuthorId = materialsDetails.find(
          (x) => x?.material_id === values.material,
        )?.author_id;
        const materialAuthor = await fetch(`${API_BASE_URL}/users/${materialAuthorId}`).then((x) => x.json());
        temporaryAuthors.push({ name: materialAuthor.user_name, image: `https://i.pravatar.cc/50?img=${Math.random()}` });
      }

      // the one who is the assumed author
      // const assumedAuthor = authorSuggestions.find((x) => x?.user_id === author);
      // temporaryAuthors.push({ name: assumedAuthor?.user_name, image: `https://i.pravatar.cc/50?img=${Math.random()}` });

      return temporaryAuthors;
    })();

    // submit
    await onComplete({
      ...values, creation: creationUUIDFromLink || creation, author, involvedAuthors,
    });
  };

  const handleCreationLinkChange = async (event) => {
    const link = event.target.value?.trim();
    const creationId = /((\w{4,12}-?)){5}/.exec(link)?.[0];

    // uuid length is 36 chars
    if (creationId?.length !== 36) {
      setError('Invalid Creation Link');
      setMaterialsDetails(null);
      setCreationUUIDFromLink(null);
    } else {
      setCreationUUIDFromLink(creationId);
      try {
        setLoading(true);

        // get creation details
        const creationDetail = await fetch(`${API_BASE_URL}/creations/${creationId}`).then((x) => x.json());
        if (creationDetail?.code >= 400) throw new Error('Invalid Creation Link. Please make sure the link is correct');
        setCreationUUIDDetailsFromLink(creationDetail);

        // get details of creation author
        const creationAuthor = await fetch(`${API_BASE_URL}/users/${creationDetail.author_id}`).then((x) => x.json());
        setCreationOrMaterialAuthor(creationAuthor);

        // get material details of creation
        if (creationDetail?.materials?.length > 0) {
          const { materials } = creationDetail;
          const response = await Promise.all(materials.map(async (x) => getMaterialDetail(x)));
          setMaterialsDetails(response.filter((x) => x.is_claimable));
        } else {
          setMaterialsDetails(null);
        }
      } catch {
        setLoading(false);
        setError('Invalid Creation Link. Please make sure the link is correct');
        return;
      } finally {
        setLoading(false);
      }

      setError(null);
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
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

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', sm: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading" />
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', sm: '18px' }} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
            <Typography className="heading">Creation Title</Typography>
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '8px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading" />
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '8px' }}>
            <Input
              variant="dark"
              placeholder="Select the creation with authorship infringement"
              name="creation"
              hookToForm
              onChange={onCreationSelect}
              onInput={onCreationInputChange}
              autoComplete
              autoCompleteOptions={
                creationSuggestions.map(
                  (x) => ({ label: x.creation_title, id: x.creation_id }),
                ) || []
              }
            />
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '8px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading" />
          </Grid>
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '8px' }} display="flex" flexDirection="row" alignItems="center" justifyContent="center">
            <Typography className="heading">or point it</Typography>
          </Grid>

          <Grid md={2} xs={12} marginTop={{ xs: '8px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading" />
          </Grid>
          <Grid xs={12} md={10} marginTop={{ xs: '8px' }}>
            <Input
              variant="dark"
              placeholder="Paste the link of the creation"
              name="creationLink"
              onChange={handleCreationLinkChange}
            />
          </Grid>

          {creationOrMaterialAuthor && (
          <>
            <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
              <Typography className="heading">Authored By</Typography>
            </Grid>
            <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }} textAlign="center">
              <h4 className="h4">
                {creationOrMaterialAuthor?.user_name}
              </h4>
            </Grid>
          </>
          )}

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

          {materialsDetails && materialsDetails?.length > 0
          && (
          <>
            <Grid
              xs={12}
              md={3}
              lg={2}
              marginTop={{ xs: '12px', md: '18px' }}
              display="flex"
              flexDirection="row"
              alignItems="center"
            >
              <Typography className="heading">Material</Typography>
            </Grid>
            <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
              <Select
                variant="dark"
                placeholder="Select the material with authorship infringement"
                name="material"
                hookToForm
                options={
                  materialsDetails.map(
                    (x) => ({ value: x.material_id, label: x.material_title }),
                  )
              }
              />
            </Grid>
          </>
          )}

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
          {loading ? <Loader />
            : 'Next'}
        </Button>
      </Grid>
    </Form>
  );
}
