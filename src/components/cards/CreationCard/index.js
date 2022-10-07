/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import {
  Box, Button, Grid, Typography, Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import DownloadIconSVG from '../../../assets/svgs/download.svg';

import DownloadButton from './btns/DownloadButton';
import EditButton from './btns/EditButton';
import RemoveButton from './btns/RemoveButton';
import ShareButton from './btns/ShareButton';
import './index.css';
import { getUrlFileType } from '../../../utils/helpers/getUrlFileType';
import CloseIcon from '../../../assets/svgs/close.svg';

function DeleteCofirmationDialog({ onClose, onConfirm }) {
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

function CreationDetailsPreviewDialog(
  {
    creation = {
      title: 'First Creation',
      description: 'Lorem Ipsum',
      source: 'https://example.com',
      date: '4/4/22',
      author: {
        user_name: 'ninja',
      },
      materials: [
        {
          title: 'First Material',
          fileType: 'image',
          link: 'https://example.com',
          author: 'turtle',
        },
      ],
    },
    onClose = () => {},
  },
) {
  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="creation-preview">
        <div className="creation-preview-header">
          <Typography className="heading h4">Preview</Typography>
          <Button padding="0" minWidth="0" onClick={() => onClose()}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="creation-preview-content">
          <div className="creation-preview-grid">
            <span className="heading">Title</span>
            <span>{creation?.title}</span>

            <span className="heading">Description</span>
            <span>{creation?.description}</span>

            <span className="heading">Source</span>
            <span>{creation?.source}</span>

            <span className="heading">Date</span>
            <span>{creation?.date}</span>

            <span className="heading">Author</span>
            <span>{creation?.author?.user_name}</span>
          </div>

          {creation?.materials && (
            <>
              <h4 className="heading h4">Materials Submitted</h4>
              <table>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Link</th>
                  <th>Author</th>
                </tr>
                {creation?.materials?.map((x) => (
                  <tr>
                    <td>{x?.title}</td>
                    <td className="capitalize">{x?.fileType}</td>
                    <td><a href={x?.link}>{x?.link}</a></td>
                    <td>{x?.author}</td>
                  </tr>
                ))}
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaPreview({ mediaType, mediaUrl, onClose }) {
  return (
    <div
      className="media-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={`media-preview-content ${mediaType === 'audio' && 'media-preview-content-audio'
        } ${mediaType === 'document'
          && !mediaUrl.includes('.pdf')
          && 'media-preview-content-unsupported'
        }`}
      >
        {mediaType === 'image' && <img src={mediaUrl} alt="" />}
        {mediaType === 'video' && <video src={mediaUrl} controls />}
        {mediaType === 'audio' && <audio src={mediaUrl} controls />}
        {mediaType === 'document' && mediaUrl.includes('.pdf') && <embed src={mediaUrl} />}
        {mediaType === 'document' && !mediaUrl.includes('.pdf') && (
          <>
            <h4 className="heading h4">Are you okay to download this file?</h4>
            <a href={mediaUrl}>{mediaUrl}</a>
            <div className="media-preview-content-options">
              <Button className="btn btn-primary-outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="btn btn-primary icon-btn"
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                onClick={() => window.open(mediaUrl)}
              >
                <img src={DownloadIconSVG} alt="" />
                Download
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CollectionCard({
  interactionBtns,
  creationDate = '2022-01-01 00:00:00',
  materials = [{
    title: 'First Material',
    fileType: 'image',
    link: 'https://example.com',
    author: 'turtle',
  }],
  title = 'Mobile App Design',
  description = '1000+ free files you can duplicate, remix, and reuse 1000+ free files',
  mediaUrl = 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?cs=srgb&dl=pexels-pixabay-415071.jpg&fm=jpg',
  canEdit = true,
  canDelete = true,
  onEditClick = () => {},
  onDeleteClick = () => {},
}) {
  const [mediaType, setMediaType] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(null);
  const [showCreationDetailsPreview, setShowCreationDetailsPreview] = useState(null);

  useEffect(() => {
    const x = getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);

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
      {showCreationDetailsPreview && (
        <CreationDetailsPreviewDialog
          creation={{
            title,
            description,
            source: mediaUrl,
            date: creationDate,
            materials,
          }}
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
          <div
            className="collection-card-media-container"
            onClick={() => setShowMediaPreview(true)}
          >
            {mediaType === 'image' && (
              <img className="collection-card-media" alt="collection-card-hero" src={mediaUrl} />
            )}
            {mediaType === 'video' && (
              <>
                <video
                  className="collection-card-media"
                  src={`${mediaUrl}#t=0.5`}
                  preload="metadata"
                />
                <div className="overlay-button">
                  <svg
                    stroke="#ffffff"
                    fill="#ffffff"
                    strokeWidth="0"
                    viewBox="0 0 448 512"
                    height="44px"
                    width="44px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
                  </svg>
                </div>
              </>
            )}
            {mediaType === 'audio' && (
              <>
                <div className="collection-card-media creation-card-media-overlay" />
                <div className="overlay-button">
                  <svg
                    stroke="#ffffff"
                    fill="#ffffff"
                    strokeWidth="0"
                    viewBox="0 0 448 512"
                    height="44px"
                    width="44px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
                  </svg>
                </div>
              </>
            )}
            {(mediaType === 'document' || mediaType === null) && (
              <>
                <div className="collection-card-media creation-card-media-overlay" />
                <div className="overlay-button">
                  <svg
                    stroke="#ffffff"
                    fill="#ffffff"
                    strokeWidth="0"
                    viewBox="0 0 512 512"
                    height="64px"
                    width="64px"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M428 224H288a48 48 0 01-48-48V36a4 4 0 00-4-4h-92a64 64 0 00-64 64v320a64 64 0 0064 64h224a64 64 0 0064-64V228a4 4 0 00-4-4zm-92 160H176a16 16 0 010-32h160a16 16 0 010 32zm0-80H176a16 16 0 010-32h160a16 16 0 010 32z" />
                    <path d="M419.22 188.59L275.41 44.78a2 2 0 00-3.41 1.41V176a16 16 0 0016 16h129.81a2 2 0 001.41-3.41z" />
                  </svg>
                </div>
              </>
            )}
          </div>
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
            {materials.length === 0 ? (
              <Chip
                style={{
                  backgroundColor: 'var(--color-orange)',
                  color: 'var(--color-white)',
                  fontSize: '14px',
                }}
                label="Not a collaborative creation"
              />
            ) : (
              materials.map((x, index) => (
                <img key={index} src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
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
              <DownloadButton />
              <EditButton
                canEdit={canEdit}
                onEditClick={onEditClick}
              />
              <ShareButton />
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default CollectionCard;
