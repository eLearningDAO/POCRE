/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import {
  Box, Button, Chip, Grid, Typography,
} from '@mui/material';
import CreationCardImg from 'assets/images/creation-card.png';
import PencilIcon from 'assets/images/pencil.png';
import CheckMarkIcon from 'assets/svgs/checkmark.svg';
import DeleteIcon from 'assets/svgs/delete.svg';
import DownloadIconSVG from 'assets/svgs/download.svg';
import EyeOffIcon from 'assets/svgs/eye-off.svg';
import PendingIcon from 'assets/svgs/pending.svg';
import RequestAcceptFilledIcon from 'assets/svgs/request-accept-filled.svg';
import RequestAcceptOutlinedIcon from 'assets/svgs/request-accept-outlined.svg';
import RequestDeclineFilledIcon from 'assets/svgs/request-decline-filled.svg';
import RequestDeclineOutlinedIcon from 'assets/svgs/request-decline-outlined.svg';
import { useEffect, useState } from 'react';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import './index.css';

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

function MaterialCard({
  interactionBtns,
  requestAccepted = true,
  username = 'jack 50',
  userimage = '',
  userProfileId = '',
  link = 'https://www.youtube.com/watch?v=2BjYPFBh4Zc',
  title = 'Mobile App Design',
  mediaUrl = CreationCardImg,
  showReconcilateOptions = true,
  onDeleteClick = () => {},
  onEditClick = () => {},
  canHide = true,
  canEdit = true,
  canDelete = true,
  canAccept = true,
  canDecline = true,
  recognitionStatus = null,
}) {
  const [mediaType, setMediaType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(null);

  useEffect(() => {
    const x = getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);

  return (
    <>
      {showMediaPreview && (
        <MediaPreview
          mediaType={mediaType}
          mediaUrl={mediaUrl}
          onClose={() => setShowMediaPreview(false)}
        />
      )}
      <Grid
        container
        className="material-card"
        gap={{
          xs: '24px',
          md: '32px',
        }}
        maxWidth={{ xs: '300px', sm: '400px', md: '100%' }}
        minWidth={{ xs: '300px', sm: '400px', md: '100%' }}
        flexWrap={{ md: 'nowrap' }}
      >

        <Grid
          item
          xs={12}
          md={6}
          display="flex"
          marginTop="auto"
          marginBottom="auto"
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
            {title && (
              <Typography variant="h6" fontSize={{ xs: '18px', lg: '24px' }} marginBottom="5px" style={{ wordBreak: 'break-word' }}>
                {title}
              </Typography>
            )}
            {link && (
              <Typography variant="a" component="a" href={link} style={{ wordBreak: 'break-word' }}>
                {link}
              </Typography>
            )}
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={interactionBtns && (canEdit || canDelete || canHide) ? 5 : 6}
          display="flex"
          flexDirection={{ xs: 'column', xl: 'row' }}
          justifyContent="center"
          alignItems="center"
          gap={{ xs: '12px', sm: '12px', md: '16px' }}
          borderLeft={{ md: '1px solid #EEF0F3' }}
          paddingLeft={{ md: '12px' }}
          borderRight={{ md: interactionBtns && (canEdit || canDelete || canHide) ? '1px solid #EEF0F3' : '' }}
          paddingRight={{ md: interactionBtns && (canEdit || canDelete || canHide) ? '12px' : '' }}
        >

          <Grid display="flex" gap="12px" alignItems="center">
            {userProfileId ? (
              <a href={`wallet/${userProfileId}`}>
                <img
                  alt="avatar"
                  className="profile-pic profile-pic-small profile-pic-rounded"
                // eslint-disable-next-line unicorn/prefer-module
                  src={userimage || require('assets/images/profile-placeholder.png')}
                />
              </a>
            )
              : (
                <img
                  alt="avatar"
                  className="profile-pic profile-pic-small profile-pic-rounded"
                // eslint-disable-next-line unicorn/prefer-module
                  src={userimage || require('assets/images/profile-placeholder.png')}
                />
              )}
            <span>
              By
              {userProfileId
                ? (
                  <a href={`wallet/${userProfileId}`}>
                    {username}
                  </a>
                )
                : username}
            </span>
          </Grid>

          {
            recognitionStatus
            && (
              <Chip
                label={`Recognition invite ${recognitionStatus === 'accepted' ? 'was accepted' : (recognitionStatus === 'declined' ? 'was declined' : 'is pending')}`}
                className={`color-white ${recognitionStatus === 'accepted' ? 'bg-green' : (recognitionStatus === 'declined' ? 'bg-red' : 'bg-purple')}`}
              />
            )
          }

          {showReconcilateOptions && (
            <Grid display="flex" gap="12px" flexWrap={{ md: 'wrap', lg: 'initial' }} justifyContent={{ md: 'center', lg: 'initial' }}>
              <Button className={requestAccepted ? 'approveButton' : 'pendingButton'}>
                <img src={requestAccepted ? CheckMarkIcon : PendingIcon} alt={requestAccepted ? 'accept-btn' : 'decline-btn'} />
                {requestAccepted ? 'Approve' : 'Pending'}
              </Button>

              <Grid display="flex" gap="12px" alignItems="center">
                {canAccept && (
                  <Button className={`material-card-action-btn ${requestAccepted ? 'bg-green' : 'bg-green-20'}`}>
                    {requestAccepted ? <img src={RequestAcceptFilledIcon} alt="accept" />
                      : <img src={RequestAcceptOutlinedIcon} alt="accept" />}
                  </Button>
                )}
                {canDecline && (
                  <Button className={`material-card-action-btn ${!requestAccepted ? 'bg-red' : 'bg-red-20'}`}>
                    {!requestAccepted ? <img src={RequestDeclineFilledIcon} alt="decline" />
                      : <img src={RequestDeclineOutlinedIcon} alt="decline" />}
                  </Button>
                )}
              </Grid>
            </Grid>
          )}
        </Grid>

        {interactionBtns && (canEdit || canDelete || canHide) && (
          <Grid item md={1} xs={12} margin="auto" display="flex" justifyContent="center" alignItems="center">
            <Grid display="flex" flexDirection={{ xs: 'row', md: 'column' }} justifyContent="space-between" maxWidth="200px" margin={{ xs: 'auto', sm: '0' }} alignItems="center" gap={{ xs: '12px', md: '16px' }}>
              {canHide && (
                <Button className="material-card-action-btn material-card-action-btn-gray">
                  <img src={EyeOffIcon} alt="" />
                </Button>
              )}
              {canEdit && (
                <Button className="material-card-action-btn material-card-action-btn-gray" onClick={onEditClick}>
                  <img src={PencilIcon} alt="" />
                </Button>
              )}
              {canDelete && (
                <Button className="material-card-action-btn material-card-action-btn-gray" onClick={onDeleteClick}>
                  <img src={DeleteIcon} alt="" />
                </Button>
              )}
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
}

export default MaterialCard;
