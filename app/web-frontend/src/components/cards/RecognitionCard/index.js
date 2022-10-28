/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import {
  Box, Button, Chip, Grid, Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import DownloadIconSVG from '../../../assets/svgs/download.svg';
import { getUrlFileType } from '../../../utils/helpers/getUrlFileType';
import './index.css';
// import EyeImage from '../../../assets/eye.webp';

function MediaPreview({ mediaType, mediaUrl, onClose }) {
  return (
    <div className="media-preview-container" onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className={`media-preview-content ${mediaType === 'audio' && 'media-preview-content-audio'} ${mediaType === 'document' && !mediaUrl.includes('.pdf') && 'media-preview-content-unsupported'}`}>
        {mediaType === 'image' && <img src={mediaUrl} alt="" />}
        {mediaType === 'video' && (
        <video
          src={mediaUrl}
          controls
        />
        )}
        {mediaType === 'audio' && (
        <audio
          src={mediaUrl}
          controls
        />
        )}
        {mediaType === 'document' && mediaUrl.includes('.pdf') && <embed src={mediaUrl} />}
        {mediaType === 'document' && !mediaUrl.includes('.pdf')
        && (
        <>
          <h4 className="heading h4">Are you okay to download this file?</h4>
          <a href={mediaUrl}>{mediaUrl}</a>
          <div className="media-preview-content-options">
            <Button className="btn btn-primary-outlined" onClick={onClose}>Cancel</Button>
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

function RecognitionCard({
  id = '',
  creationDate = '2022-01-01 00:00:00',
  title = 'Mobile App Design',
  description = '1000+ free files you can duplicate, remix, and reuse 1000+ free files',
  mediaUrl = 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?cs=srgb&dl=pexels-pixabay-415071.jpg&fm=jpg',
  recognizedByUserName = 'jack 58',
  awaitingRecognitionByUserName = '',
  isPending = false,
  isAccepted = false,
  isDeclined = false,
  acceptedOn = null,
  canAccept = false,
  declinedOn = null,
  canDecline = false,
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
            <img
              className="collection-card-media"
              alt="collection-card-hero"
              src={mediaUrl}
            />
            )}
            {mediaType === 'video' && (
            <>
              <video
                className="collection-card-media"
                src={`${mediaUrl}#t=0.5`}
                preload="metadata"
              />
              <div className="overlay-button">
                <svg stroke="#ffffff" fill="#ffffff" strokeWidth="0" viewBox="0 0 448 512" height="44px" width="44px" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" /></svg>
              </div>
            </>
            )}
            {mediaType === 'audio' && (
            <>
              <div
                className="collection-card-media creation-card-media-overlay"
              />
              <div className="overlay-button">
                <svg stroke="#ffffff" fill="#ffffff" strokeWidth="0" viewBox="0 0 448 512" height="44px" width="44px" xmlns="http://www.w3.org/2000/svg"><path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" /></svg>
              </div>
            </>
            )}
            {(mediaType === 'document' || mediaType === null) && (
            <>
              <div
                className="collection-card-media creation-card-media-overlay"
              />
              <div className="overlay-button">
                <svg stroke="#ffffff" fill="#ffffff" strokeWidth="0" viewBox="0 0 512 512" height="64px" width="64px" xmlns="http://www.w3.org/2000/svg">
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
            gap="5px"
            flexDirection="column"
            justifyContent="center"
          >
            <Typography variant="h6" fontSize={{ xs: '18px', lg: '24px' }}>
              {title}
            </Typography>
            <Typography variant="p" component="p">
              {description}
            </Typography>
            <a className="recognition-card-link" href={`/recognitions/${id}`}>
              <h4>
                View Details
                {canAccept || canDecline ? ' to respond' : ''}
              </h4>
              {' '}
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
            </a>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={6}
          lg={5}
          display="flex"
          flexDirection="column"
          gap={{ xs: '12px', sm: '12px', md: '16px' }}
          borderLeft={{ md: '1px solid #EEF0F3' }}
          paddingLeft={{ md: '12px' }}
        >
          {(isPending || isAccepted || isDeclined) && (
            <Chip
              style={{ fontSize: '16px' }}
              label={`Creation authorship 
              ${(isPending && 'pending') || (isAccepted && 'accepted') || (isDeclined && 'declined')}`}
              className={`color-white ${isPending && 'bg-black'} ${isAccepted && 'bg-green'} ${isDeclined && 'bg-red'}`}
            />
          )}
          {(recognizedByUserName || awaitingRecognitionByUserName) && (
            <div className="collection-member-images">
              <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
              <p>
                {recognizedByUserName ? 'Recognized by' : ((isPending && 'Awaiting recognition by') || (isAccepted && 'Recognized by') || (isDeclined && 'Rejected by'))}
                {' '}
                <span className="heading">
                  {recognizedByUserName || awaitingRecognitionByUserName}
                </span>
              </p>
            </div>
          )}
          <Box alignItems={!(recognizedByUserName || awaitingRecognitionByUserName) ? 'center' : 'flex-start'} display="flex" flexDirection="column" justifyContent="center" gap="12px">
            <Typography variant="h6" fontSize={{ xs: '16px', lg: '18px' }} {...(!(recognizedByUserName || awaitingRecognitionByUserName) && { margin: 'auto' })}>
              Date Created
            </Typography>
            <Typography variant="p" fontSize={{ xs: '14px', lg: '16px' }} {...(!(recognizedByUserName || awaitingRecognitionByUserName) && { margin: 'auto' })}>
              {creationDate}
            </Typography>
            {acceptedOn && (
            <p className="color-green">
              You have accepted this invitation on
              {' '}
              <span className="heading color-green">{acceptedOn}</span>
            </p>
            )}
            {declinedOn && (
            <p className="color-red">
              You have declined this invitation on
              {' '}
              <span className="heading color-red">{declinedOn}</span>
            </p>
            )}
            {/* {(canAccept || canDecline) && (
            <Box
              display="flex"
              gap="12px"
              justifyContent="flex-start"
              alignItems="center"
              width="100%"
              flexWrap="wrap"
            >
              {canAccept && (
              <Button
                className="btn bg-green color-white"
                onClick={onAccept}
              >
                Accept Authorship
              </Button>
              )}
              {canDecline && (
              <Button
                className="btn bg-red color-white"
                onClick={onDecline}
              >
                I&apos;m not the author
              </Button>
              )}
            </Box>
            )} */}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default RecognitionCard;
