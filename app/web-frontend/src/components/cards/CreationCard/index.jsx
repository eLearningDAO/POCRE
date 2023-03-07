/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box, Button, Chip, Grid, Typography,
} from '@mui/material';
import MediaPreview from 'components/media/preview';
import MediaTile from 'components/media/tile';
import CreationPreview from 'components/previews/CreationPreview';
import SocialMediaModal from 'components/shared/socialmediaSharingModal';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import EditButton from './btns/EditButton';
import PreviewButton from './btns/PreviewButton';
import RemoveButton from './btns/RemoveButton';
import ShareButton from './btns/ShareButton';
import './index.css';

export function DeleteCofirmationDialog({ onClose, onConfirm }) {
  return (
    <div
      className="delete-dialog-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="delete-dialog-content">
        <h4 className="heading h4">Confirm Delete</h4>
        <p>
          Are you sure to delete this creation? All associated materials of this creation will be
          deleted forever.
        </p>
        <div className="delete-dialog-options">
          <Button className="btn btn-primary-outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button className="btn btn-primary icon-btn" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

function CreationCard({
  creationId = '',
  interactionBtns,
  creationDate = '',
  materials = [
    //   {
    //   title: 'First Material',
    //   fileType: 'image',
    //   link: 'https://example.com',
    //   author: 'turtle',
    //   author_image: '',
    //   authorProfileId: '',
    // }
  ],
  title = '',
  description = '',
  author = '',
  authorProfileId = '',
  mediaUrl = '',
  mediaType = '',
  ipfsHash = '',
  canEdit = true,
  canShare = true,
  canDelete = true,
  onEditClick = () => {},
  onDeleteClick = () => {},
  finalizationDate = '',
  canFinalize = false,
  isFinalized = false,
  onFinalize = () => {},
}) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(null);
  const [showCreationDetailsPreview, setShowCreationDetailsPreview] = useState(null);
  const [showSocialMediaSharePreview, setShowSocialMediaSharePreview] = useState(false);
  const shareUrl = `${window.location.origin}/creations/${creationId}`;

  useEffect(() => {
    if (showCreationDetailsPreview) {
      const parameters = new URLSearchParams(window.location.search);
      parameters.set('preview', creationId);
      const sanitizedNewParameters = parameters.toString().length > 0 ? `?${parameters.toString()}` : '';
      const newRelativePathQuery = window.location.origin
        + window.location.pathname + sanitizedNewParameters;
      window.history.replaceState(null, '', newRelativePathQuery);
    } else {
      window.history.replaceState(null, '', window.location.origin + window.location.pathname);
    }
  }, [showCreationDetailsPreview]);

  const handleDeleteConfirmation = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDelete = async () => {
    setShowDeleteConfirmation(false);
    if (onDeleteClick) await onDeleteClick();
  };

  return (
    <>
      {showDeleteConfirmation && (
        <DeleteCofirmationDialog
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDelete}
        />
      )}
      {showSocialMediaSharePreview && (
        <SocialMediaModal
          onClose={() => setShowSocialMediaSharePreview(false)}
          shareUrl={shareUrl}
        />
      )}
      {showCreationDetailsPreview && (
        <CreationPreview
          id={creationId}
          title={title}
          description={description}
          link={mediaUrl}
          ipfsHash={ipfsHash}
          date={creationDate}
          authorName={author}
          authorProfileId={authorProfileId}
          finalizationDate={finalizationDate}
          materials={materials?.map((x) => ({
            title: x?.title,
            fileType: x?.fileType,
            link: x?.link,
            authorName: x?.author,
            authorProfileId: x?.authorProfileId,
          }))}
          onClose={() => setShowCreationDetailsPreview(false)}
        />
      )}
      {showMediaPreview && (
        <MediaPreview
          mediaType={mediaType}
          mediaUrl={mediaUrl}
          onClose={() => setShowMediaPreview(false)}
        />
      )}
      <Grid
        container
        className="collection-card"
        gap={{ xs: '24px', md: '32px' }}
        maxWidth={{ xs: '300px', sm: '400px', md: '100%' }}
        minWidth={{ xs: '300px', sm: '400px', md: '100%' }}
        flexWrap={{ md: 'nowrap' }}
      >
        <Grid
          item
          xs={12}
          md={6}
          lg={7}
          display="flex"
          flexDirection={{ xs: 'column', lg: 'row' }}
          gap={{ xs: '12px', sm: '12px', md: '16px' }}
          height="fit-content"
        >
          <MediaTile
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            onMediaClick={() => setShowMediaPreview(true)}
          />
          <Box
            alignItems="flex-start"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography variant="h6" fontSize={{ xs: '18px', lg: '24px' }} marginBottom="5px">
              {title}
            </Typography>
            <Typography variant="p" component="p">
              {description}
            </Typography>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={interactionBtns ? 5 : 6}
          lg={interactionBtns ? 4 : 5}
          display="flex"
          flexDirection="column"
          gap={{ xs: '12px', sm: '12px', md: '16px' }}
          borderLeft={{ md: '1px solid #EEF0F3' }}
          paddingLeft={{ md: '12px' }}
          borderRight={{ md: interactionBtns ? '1px solid #EEF0F3' : '' }}
          paddingRight={{ md: interactionBtns ? '12px' : '' }}
        >
          <div className="collection-member-images">
            {materials?.length === 0 ? (
              <Chip
                style={{
                  backgroundColor: 'var(--color-orange)',
                  color: 'var(--color-white)',
                  fontSize: '14px',
                }}
                label="Not a collaborative creation"
              />
            ) : (
              materials?.map((x, index) => (
                x?.authorProfileId ? (
                  <Link to={`/wallet/${x.authorProfileId}`}>
                    <img
                      alt=""
                      key={index}
                      className="profile-pic profile-pic-small profile-pic-rounded"
                      // eslint-disable-next-line unicorn/prefer-module
                      src={x?.author_image || require('assets/images/profile-placeholder.png')}
                    />
                  </Link>
                ) : (
                  <img
                    alt=""
                    key={index}
                    className="profile-pic profile-pic-small profile-pic-rounded"
                    // eslint-disable-next-line unicorn/prefer-module
                    src={x?.author_image || require('assets/images/profile-placeholder.png')}
                  />
                )
              ))
            )}
          </div>
          <Box
            alignItems="flex-start"
            display="flex"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography variant="h6" fontSize={{ xs: '16px', lg: '18px' }} marginBottom="5px">
              Date Created
            </Typography>
            <Typography variant="p" fontSize={{ xs: '14px', lg: '16px' }}>
              {creationDate}
            </Typography>
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
          >
            <Link className="creation-details-link" to={`/creations/${creationId}`}>
              <h4>
                View Details
              </h4>
              {' '}
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
            </Link>
          </Box>
          <Chip
            style={{
              backgroundColor: 'var(--color-black)',
              color: 'var(--color-white)',
              fontSize: '14px',
            }}
            label={`Finalization on ${finalizationDate}`}
          />
          {canFinalize && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="center"
            >
              {isFinalized ? (
                <Chip
                  style={{
                    backgroundColor: 'var(--color-black)',
                    color: 'var(--color-white)',
                    fontSize: '14px',
                  }}
                  label="Finalized"
                />
              ) : (
                <Button onClick={onFinalize} className="approveButton">
                  Finalize
                </Button>
              )}
            </Box>
          )}
        </Grid>

        {interactionBtns && (
          <Grid item md={1} xs={12} display="flex" alignItems="center">
            <Grid
              display="flex"
              flexDirection={{ xs: 'row', md: 'column', xl: 'arow' }}
              justifyContent="space-between"
              maxWidth="200px"
              margin={{ xs: 'auto', sm: '0' }}
              alignItems="center"
              gap={{ xs: '12px', md: '16px' }}
            >
              <RemoveButton
                canDelete={canDelete}
                handleDeleteConfirmation={handleDeleteConfirmation}
              />
              <PreviewButton
                onClick={() => setShowCreationDetailsPreview(true)}
              />
              <EditButton
                canEdit={canEdit}
                onEditClick={onEditClick}
              />
              { canShare && (
                <ShareButton
                  onClick={() => setShowSocialMediaSharePreview(true)}
                />
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default CreationCard;
