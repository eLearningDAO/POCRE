/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box, Chip, Grid, Typography,
} from '@mui/material';
import MediaPreview from 'components/media/preview';
import MediaTile from 'components/media/tile';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import './index.css';

function RecognitionCard({
  id = '',
  creationDate = '2022-01-01 00:00:00',
  title = 'Mobile App Design',
  description = '1000+ free files you can duplicate, remix, and reuse 1000+ free files',
  mediaUrl = 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?cs=srgb&dl=pexels-pixabay-415071.jpg&fm=jpg',
  mediaType = '',
  recognizedByUserName = 'jack 58',
  awaitingRecognitionByUserName = '',
  userImage = '',
  userProfileId = '',
  isPending = false,
  isAccepted = false,
  isDeclined = false,
  acceptedOn = null,
  canAccept = false,
  declinedOn = null,
  canDecline = false,
  isPendingPaymentConfirmation = false,
}) {
  const [showMediaPreview, setShowMediaPreview] = useState(null);

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
          <MediaTile
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            onMediaClick={() => setShowMediaPreview(true)}
          />
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
            <Link className="recognition-card-link" to={`/recognitions/${id}`}>
              <h4>
                View Details
                {canAccept || canDecline ? ' to respond' : ''}
              </h4>
              {' '}
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
            </Link>
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
          {(isPendingPaymentConfirmation) && (
            <Chip
              style={{ fontSize: '16px' }}
              label="Pending payment confirmation"
              className={`color-white ${isPending && 'bg-black'} ${isAccepted && 'bg-green'} ${isDeclined && 'bg-red'}`}
            />
          )}
          {(recognizedByUserName || awaitingRecognitionByUserName) && (
            <div className="collection-member-images">
              <Link to={`/wallet/${userProfileId}`}>
                <img
                  alt=""
                  className="profile-pic profile-pic-small profile-pic-rounded"
                  src={userImage}
                />
              </Link>
              <p>
                {recognizedByUserName ? 'Recognized by' : ((isPending && 'Awaiting recognition by') || (isAccepted && 'Recognized by') || (isDeclined && 'Rejected by'))}
                {' '}
                <Link to={`/wallet/${userProfileId}`}>
                  <span className="heading">
                    {recognizedByUserName || awaitingRecognitionByUserName}
                  </span>
                </Link>
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
                You have accepted this recognition on
                {' '}
                <span className="heading color-green">{acceptedOn}</span>
              </p>
            )}
            {declinedOn && (
              <p className="color-red">
                You have declined this recognition on
                {' '}
                <span className="heading color-red">{declinedOn}</span>
              </p>
            )}
          </Box>
        </Grid>
      </Grid>
    </>
  );
}

export default RecognitionCard;
