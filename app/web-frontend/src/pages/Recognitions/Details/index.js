/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import Cookies from 'js-cookie';
import {
  Chip,
  Grid,
  Typography,
  //  Box,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import moment from 'moment';
import React, {
  useEffect,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
// import MaterialCard from '../../../components/cards/MaterialCard';
import Loader from '../../../components/uicore/Loader';
import './index.css';
import useDetails from './useDetails';
import { getUrlFileType } from '../../../utils/helpers/getUrlFileType';
import DownloadIconSVG from '../../../assets/svgs/download.svg';
import PreviewIcon from '../../../assets/svgs/preview.svg';
import CloseIcon from '../../../assets/svgs/close.svg';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

export default function CreationDetails() {
  const { id } = useParams();

  const [mediaType, setMediaType] = useState(null);
  const [creationMediaType, setCreationMediaType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    recognition,
    fetchRecognitionDetails,
    fetchRecognitionStatus,
    isFetchingRecognition,
    acceptRecognition,
    declineRecognition,
    isAcceptingRecognition,
    isDecliningRecognition,
    acceptRecognitionStatus,
    declineRecognitionStatus,
    setAcceptRecognitionStatus,
    setDeclineRecognitionStatus,
  } = useDetails();

  useEffect(() => {
    if (id) fetchRecognitionDetails(id);
  }, [id]);

  useEffect(() => {
    const invitationFileType = getUrlFileType(recognition?.material?.material_link);
    setMediaType(invitationFileType);

    const creationFileType = getUrlFileType(recognition?.material?.material_link);
    setCreationMediaType(creationFileType);
  }, [recognition]);

  const onCloseAcceptNotificationPopup = () => {
    setAcceptRecognitionStatus({
      success: false,
      error: null,
    });
  };

  const onCloseDeclineNotificationPopup = () => {
    setDeclineRecognitionStatus({
      success: false,
      error: null,
    });
  };

  if (isFetchingRecognition) return <Loader />;

  if (fetchRecognitionStatus.error) {
    return (
      <h2 className="color-red">
        {fetchRecognitionStatus.error}
      </h2>
    );
  }

  return (
    <>
      {showPreview && (
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions
      <div
        className="creation-preview-container"
        onClick={(event) => event.target === event.currentTarget && setShowPreview(false)}
      >
        <div className="creation-preview">
          <div className="creation-preview-header">
            <Typography className="heading h4">Preview</Typography>
            <Button padding="0" minWidth="0" onClick={() => setShowPreview(false)}>
              <img src={CloseIcon} height="24" width="24" alt="" />
            </Button>
          </div>
          <div className="creation-preview-content">
            <div className="creation-preview-grid">
              <span className="heading">Title</span>
              <span>{recognition?.creation?.creation_title}</span>

              <span className="heading">Description</span>
              <span>{recognition?.creation?.creation_description}</span>

              <span className="heading">Source</span>
              <span>{recognition?.creation?.source?.site_url}</span>

              <span className="heading">Date</span>
              <span>{moment(recognition?.creation?.creation_date).format('DD/MM/YYYY')}</span>

              <span className="heading">Author</span>
              <span>{recognition?.creation?.author?.user_name}</span>
            </div>

            {recognition?.creation?.materials && (
              <>
                <h4 className="heading h4">Materials Submitted</h4>
                <table>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Link</th>
                    <th>Author</th>
                  </tr>
                  {recognition?.creation?.materials?.map((x) => (
                    <tr>
                      <td>{x.material_title}</td>
                      <td className="capitalize">{x?.type?.type_name}</td>
                      <td><a href={x?.material_link}>{x?.material_link}</a></td>
                      <td>{x.author?.user_name}</td>
                    </tr>
                  ))}
                </table>
              </>
            )}
          </div>
        </div>
      </div>
      )}
      {(isAcceptingRecognition || isDecliningRecognition) && <Loader withBackdrop size="large" />}

      {(acceptRecognitionStatus.success || acceptRecognitionStatus.error) && (
      <Snackbar
        open
        onClose={onCloseAcceptNotificationPopup}
      >
        <Alert
          onClose={onCloseAcceptNotificationPopup}
          icon={false}
          className={acceptRecognitionStatus.success ? 'bg-green color-white' : 'bg-red color-white'}
          sx={{ width: '100%' }}
        >
          {acceptRecognitionStatus.success ? 'Invitation Accepted!' : acceptRecognitionStatus.error}
        </Alert>
      </Snackbar>
      )}
      {(declineRecognitionStatus.success || declineRecognitionStatus.error) && (
      <Snackbar
        open
        onClose={onCloseDeclineNotificationPopup}
      >
        <Alert
          onClose={onCloseDeclineNotificationPopup}
          icon={false}
          className={declineRecognitionStatus.success ? 'bg-green color-white' : 'bg-red color-white'}
          sx={{ width: '100%' }}
        >
          {declineRecognitionStatus.success ? 'Invitation Declined!' : declineRecognitionStatus.error}
        </Alert>
      </Snackbar>
      )}
      <Grid item xs={12}>
        <Grid item xs={12}>
          <Typography className="litigationCloseTitle" variant="h6">
            {authUser?.user_id === recognition?.invite_to?.user_id ? 'You were ' : recognition?.invite_to?.user_name}
            {' '}
            recognized by
            {' '}
            {recognition?.invite_from?.user_name}
            {' '}
            for
            {' '}
            {recognition?.material?.material_title}
          </Typography>
        </Grid>

        <Grid
          display="flex"
          flexDirection="column"
          gap="12px"
          alignItem="flex-top"
          marginTop="18px"
          width="100%"
        >
          <div
            className="creation-media"
          >
            {mediaType === 'image' && (
            <img alt="collection-card-hero" src={recognition?.material?.material_link} />
            )}
            {mediaType === 'video' && (
            <video
              src={recognition?.material?.material_link}
              preload="metadata"
              controls
            />
            )}
            {mediaType === 'audio' && (
            <audio src={recognition?.material?.material_link} controls />
            )}
            {(mediaType === 'document' && recognition?.material?.material_link?.includes('.pdf')) && (
            <embed src={recognition?.material?.material_link} />
            )}
            {mediaType === 'document' && !recognition?.material?.material_link?.includes('.pdf') && (
            <div className="unsupported-file-type">
              <h4 className="heading h4">Are you okay to download this file?</h4>
              <a href={mediaType}>{recognition?.material?.material_link}</a>
              <div className="media-preview-content-options">
                <Button
                  className="btn btn-primary icon-btn"
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                  onClick={() => window.open(recognition?.material?.material_link)}
                >
                  <img src={DownloadIconSVG} alt="" />
                  Download
                </Button>
              </div>
            </div>
            )}
          </div>
        </Grid>

        <Grid
          display="flex"
          gap="12px"
          alignItems="center"
          justifyContent="space-between"
          marginTop="18px"
          width="100%"
        >
          <div className="collection-member-images">
            <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
            <p>
              Recognized by
              {' '}
              {recognition?.invite_from?.user_name}
            </p>
          </div>
          <Chip style={{ fontSize: '16px', margin: 0 }} className="mr-auto bg-orange color-white" label={`Recognized on ${moment(recognition?.invite_issued).format('DD/MM/YYYY')}`} />
        </Grid>

        <Grid
          display="flex"
          flexDirection="column"
          gap="12px"
          alignItems="flex-end"
          marginTop="18px"
          width="100%"
          marginLeft="auto"
        >
          {authUser?.user_id === recognition?.invite_to?.user_id
           && recognition?.status?.status_name === 'pending'
            ? (
              <>
                <Typography className="litigationCloseTitle" variant="h6">
                  Pending Actions
                </Typography>
                <Button
                  className="btn bg-green color-white"
                  onClick={acceptRecognition}
                >
                  Accept Authorship
                </Button>
                <Button
                  className="btn bg-red color-white"
                  onClick={declineRecognition}
                >
                  I&apos;m not the author
                </Button>
              </>
            )
            : (
              <Chip
                style={{ fontSize: '16px', margin: 0, marginLeft: 'auto' }}
                className={`mr-auto color-white ${recognition?.status?.status_name === 'accepted' ? 'bg-green' : 'bg-red'}`}
                label={`${recognition?.status?.status_name === 'accepted' ? 'Accepted on' : 'Declined on'} ${moment(recognition?.status?.action_made).format('DD/MM/YYYY')}`}
              />
            )}
        </Grid>

        <Grid
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          item
          xs={12}
          marginTop="24px"
        >
          <Typography className="litigationCloseTitle" variant="h6">
            Original Creation
          </Typography>
          <Button
            padding="0"
            minWidth="0"
            onClick={() => setShowPreview(true)}
          >
            <img src={PreviewIcon} height="36" width="36" alt="" />
          </Button>
        </Grid>

        <Grid
          display="flex"
          flexDirection="column"
          gap="12px"
          alignItem="flex-top"
          marginTop="18px"
          width="100%"
        >
          <div
            className="creation-media"
          >
            {creationMediaType === 'image' && (
            <img alt="collection-card-hero" src={recognition?.creation?.source?.site_url} />
            )}
            {creationMediaType === 'video' && (
            <video
              src={recognition?.creation?.source?.site_url}
              preload="metadata"
              controls
            />
            )}
            {creationMediaType === 'audio' && (
            <audio src={recognition?.creation?.source?.site_url} controls />
            )}
            {(creationMediaType === 'document' && recognition?.creation?.source?.site_url?.includes('.pdf')) && (
            <embed src={recognition?.creation?.source?.site_url} />
            )}
            {creationMediaType === 'document' && !recognition?.creation?.source?.site_url?.includes('.pdf') && (
            <div className="unsupported-file-type">
              <h4 className="heading h4">Are you okay to download this file?</h4>
              <a href={creationMediaType}>{recognition?.creation?.source?.site_url}</a>
              <div className="media-preview-content-options">
                <Button
                  className="btn btn-primary icon-btn"
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                  onClick={() => window.open(recognition?.creation?.source?.site_url)}
                >
                  <img src={DownloadIconSVG} alt="" />
                  Download
                </Button>
              </div>
            </div>
            )}
          </div>
        </Grid>

        <Grid item xs={12} marginTop="18px" marginLeft="auto">
          <a
            href={`/creations/${recognition?.creation?.creation_id}`}
            className="litigationCloseTitle"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            View more about this creation
            {' '}
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
          </a>
        </Grid>
      </Grid>
    </>
  );
}
