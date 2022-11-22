import {
  Alert, Button, Grid, Snackbar, TextField, Typography,
} from '@mui/material';
import CreationCard from 'components/cards/CreationCard';
import Loader from 'components/uicore/Loader';
import useUserInfo from 'hooks/user/userInfo';
import moment from 'moment';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import useCreations from './useCreations';

function Creations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const login = useUserInfo((s) => s.login);
  const {
    creations,
    isLoadingCreations,
    isDeletingCreation,
    deleteCreationStatus,
    deleteCreation,
    resetDeletionErrors,
  } = useCreations();

  const add = () => {
    navigate('/creations/create');
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
            {deleteCreationStatus.success
              ? 'Creation deleted successfully!'
              : 'Failed to delete creation!'}
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
          The original creations I made
        </Typography>
        <Grid gap={{ sm: '8px' }} display="flex" height="fit-content" flexDirection="row">
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
                  creationDate={moment(x?.creation_date).format('Do MMMM YYYY')}
                  interactionBtns
                  mediaUrl={x?.source?.site_url}
                  author={x?.author?.user_name}
                  materials={x.materials?.map((m) => ({
                    title: m?.material_title,
                    link: m?.material_link,
                    fileType: m?.type?.type_name,
                    author: m?.author?.user_name,
                  }))}
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
        <h4 className="heading h4 result-msg">No Creations Found</h4>
      ))}
    </Grid>
  );
}

export default Creations;
