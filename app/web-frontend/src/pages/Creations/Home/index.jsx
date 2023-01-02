import {
  Alert, Button, Grid, Snackbar, TextField, Typography,
} from '@mui/material';
import CreationCard from 'components/cards/CreationCard';
import Loader from 'components/uicore/Loader';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import Input from 'components/uicore/Input';
import './index.css';
import useCreations from './useCreations';
import useCreationDelete from '../common/hooks/useCreationDelete';

const getSuggestions = (suggestions) => {
  if (suggestions) {
    return suggestions.map(
      (x) => ({ label: x.creation_title, id: x.creation_id }),
    );
  }
  return [];
};

function Creations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const login = authUser.getUser() && authUser.getJWTToken();

  const {
    creations,
    isLoadingCreations,
    creationSuggestions,
    handleCreationInputChange,
  } = useCreations();

  const {
    isDeletingCreation,
    deleteCreationStatus,
    deleteCreation,
    resetDeletionErrors,
  } = useCreationDelete();

  const add = () => {
    navigate('/creations/create');
  };

  const onCreationSelect = (event, value) => {
    if (value?.id) {
      navigate(`/creations/${value?.id}`);
    }
  };

  const handleSearch = (event) => {
    setSearch(event.target.value.trim());
  };

  return (
    <Grid container spacing={2}>
      {isDeletingCreation && <Loader withBackdrop size="large" />}
      {(deleteCreationStatus.success || deleteCreationStatus.error) && (
        <Snackbar open onClose={resetDeletionErrors}>
          <Alert
            onClose={resetDeletionErrors}
            severity={deleteCreationStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {deleteCreationStatus.success || deleteCreationStatus.error}
          </Alert>
        </Snackbar>
      )}
      <Grid
        item
        xs={12}
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        height="fit-content"
        padding={{ xs: '12px', md: '0' }}
      >
        <Typography className="heading h4" variant="h4">
          {login ? 'The original creations I made' : 'Search Public Creations'}
        </Typography>
        <Grid gap={{ sm: '8px' }} display="flex" height="fit-content" flexDirection="row">
          {login && (
            <TextField
              variant="standard"
              InputProps={{
                disableUnderline: true,
                padding: 0,
              }}
              fullWidth
              className="input search-bar"
              placeholder="Search creations"
              id="fullWidth"
              onChange={handleSearch}
            />
          )}
          {login && (
            <Button onClick={add} className="btn btn-primary">
              + Add New Creation
            </Button>
          )}
        </Grid>
      </Grid>

      {isLoadingCreations ? (
        <div style={{ margin: 'auto' }} className="loader" />
      ) : (creations?.results?.length > 0 ? (
        <Grid
          xs={12}
          item
          display="flex"
          flexDirection={{ xs: 'row', md: 'column' }}
          overflow={{ xs: 'scroll', md: 'initial' }}
          bgcolor="transparent"
          gap={{ xs: '16px' }}
          className="hidden-scrollbar"
          padding={{ xs: '12px', md: '0' }}
        >
          {creations?.results?.map(
            (x, index) => ((x.creation_title || '') + (x.creation_description || ''))
              ?.toLowerCase()
              ?.includes(search?.toLowerCase()) && (
                <CreationCard
                  key={index}
                  creationId={x.creation_id}
                  title={x?.creation_title}
                  description={x?.creation_description}
                  creationDate={x?.creation_date}
                  interactionBtns
                  mediaUrl={x?.creation_link}
                  author={x?.author?.user_name}
                  authorProfileId={x?.author?.user_id}
                  materials={x?.materials?.length > 0 ? x?.materials?.map((m) => ({
                    title: m?.material_title,
                    link: m?.material_link,
                    fileType: m?.material_type,
                    author: m?.author?.user_name,
                    author_image: m?.author?.image_url,
                    authorProfileId: m?.author?.user_id,
                  })) : []}
                  canEdit={x.is_draft}
                  onEditClick={() => navigate(`/creations/${x.creation_id}/update`)}
                  // eslint-disable-next-line no-return-await
                  onDeleteClick={async () => await deleteCreation(x.creation_id)}
                />
            ),
          )}
          {creations?.total_results < creations?.results?.length && (
            <Button
              style={{ margin: 'auto' }}
              className="nextCollectionButton"
            >
              Load More
            </Button>
          )}
        </Grid>
      ) : (
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '8px' }}>
          {
            !login ? (
              <Input
                variant="dark"
                placeholder="Search Creations!"
                name="creation"
                onInput={(event_) => handleCreationInputChange(event_)}
                autoComplete
                onChange={onCreationSelect}
                autoCompleteOptions={
                  getSuggestions(creationSuggestions)
                }
              />
            ) : <Typography className="heading h4" variant="h4">No Creations Found</Typography>
          }
        </Grid>
      ))}
    </Grid>
  );
}

export default Creations;
