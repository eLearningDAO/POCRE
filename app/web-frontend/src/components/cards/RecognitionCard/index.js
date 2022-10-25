/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import {
  Box, Button, Grid, Typography, Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DownloadIconSVG from '../../../assets/svgs/download.svg';
import './index.css';
import { getUrlFileType } from '../../../utils/helpers/getUrlFileType';
// import EyeImage from '../../../assets/eye.webp';
import CloseIcon from '../../../assets/svgs/close.svg';

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

function CreationPreview({
  title = '',
  description = '',
  source = '',
  date = '',
  author = '',
  materials = [{
    title: '',
    fileType: '',
    link: '',
    author: '',
  }],
  onClose = () => {},
}) {
  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="creation-preview">
        <div className="creation-preview-header">
          <Typography className="heading h4">Preview</Typography>
          <Button padding="0" minWidth="0" onClick={() => onClose(false)}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="creation-preview-content">
          <div className="creation-preview-grid">
            <span className="heading">Title</span>
            <span>{title}</span>

            <span className="heading">Description</span>
            <span>{description}</span>

            <span className="heading">Source</span>
            <span>{source}</span>

            <span className="heading">Date</span>
            <span>{date}</span>

            <span className="heading">Author</span>
            <span>{author}</span>

            {/* <span className="heading">Tags</span>
            <span className="creation-tags">
              {tags.map((x, index) => <Chip key={index} label={x} />)}
            </span> */}
          </div>

          {materials && (
          <>
            <h4 className="heading h4">Materials Submitted</h4>
            <table>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Link</th>
                <th>Author</th>
              </tr>
              {materials?.map((x) => (
                <tr>
                  <td>{x.title}</td>
                  <td className="capitalize">{x.fileType}</td>
                  <td><a href={x.link}>{x.link}</a></td>
                  <td>{x.author}</td>
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

function RecognitionCard({
  creation = {
    id: '',
    title: '',
    description: '',
    source: '',
    date: '',
    materials: [],
  },
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
  onAccept = () => {},
  declinedOn = null,
  canDecline = false,
  onDecline = () => {},
}) {
  const navigate = useNavigate();
  const [mediaType, setMediaType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(null);
  const [creationPreview, showCreationPreview] = useState(false);

  useEffect(() => {
    const x = getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);

  const redirectToCreationDetailsPage = () => {
    navigate(`/creations/${creation.id}`);
  };

  return (
    <>
      {showMediaPreview && (
      <MediaPreview
        mediaType={mediaType}
        mediaUrl={mediaUrl}
        onClose={() => setShowMediaPreview(false)}
      />
      )}
      {creationPreview && (
      <CreationPreview
        title={creation?.title}
        description={creation?.description}
        source={creation?.source}
        date={creation?.date}
        author={creation?.author}
        materials={creation?.materials}
        onClose={() => showCreationPreview(false)}
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
            <Button
              style={{ fontSize: '16px' }}
              className="bg-blue color-white"
              onClick={() => showCreationPreview(true)}
            >
              Preview
            </Button>
            <Button
              style={{ fontSize: '16px' }}
              className="bg-orange-dark color-white"
              onClick={redirectToCreationDetailsPage}
            >
              View Creation Details
            </Button>
            {/* <Chip
              label="Creation preview"
              className="bg-blue color-white"
              onClick={() => showCreationPreview(true)}
              avatar={<img alt="eye" src={EyeImage} />}
            /> */}
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
            {(canAccept || canDecline) && (
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
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default RecognitionCard;
