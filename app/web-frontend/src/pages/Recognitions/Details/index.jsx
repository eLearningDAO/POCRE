/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import {
  Alert,
  //  Box,
  Button, Chip,
  Grid, Snackbar, Typography,
} from '@mui/material';
import DownloadIconSVG from 'assets/svgs/download.svg';
import PreviewButton from 'components/cards/CreationCard/btns/PreviewButton';
import ShareButton from 'components/cards/CreationCard/btns/ShareButton';
import CreationPreview from 'components/previews/CreationPreview';
import SocialMediaModal from 'components/shared/socialmediaSharingModal';
import Loader from 'components/uicore/Loader';
import moment from 'moment';
import {
  useEffect,
  useState,
} from 'react';
import { useParams, Link } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import useRecognitions from '../common/hooks/useRecognitions';
import './index.css';

// get auth user
const user = authUser.getUser();

export default function CreationDetails() {
  const { id } = useParams();

  const [mediaType, setMediaType] = useState(null);
  const [creationMediaType, setCreationMediaType] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showSocialMediaSharePreview, setShowSocialMediaSharePreview] = useState(false);
  const shareUrl = `${window.location.origin}/recognitions/${id}`;
  let recognitionStatus = '';
  let recognitionBg = '';

  const {
    recognitionDetails,
    fetchRecognitionDetails,
    fetchRecognitionDetailsStatus,
    isFetchingRecognitionDetails,
    updateRecognitionStatus,
    isUpdatingRecognition,
    updatedRecognitionStatus,
    resetUpdateRecognitionStatus,
  } = useRecognitions();

  useEffect(() => {
    if (id) fetchRecognitionDetails(id);
  }, [id]);

  useEffect(() => {
    const recognitionFileType = getUrlFileType(recognitionDetails?.material?.material_link);
    setMediaType(recognitionFileType);

    const creationFileType = getUrlFileType(recognitionDetails?.material?.material_link);
    setCreationMediaType(creationFileType);
  }, [recognitionDetails]);

  if (isFetchingRecognitionDetails) return <Loader />;

  if (fetchRecognitionDetailsStatus.error) {
    return (
      <h2 className="color-red">
        {fetchRecognitionDetailsStatus.error}
      </h2>
    );
  }
  if (recognitionDetails?.status === 'pending') {
    recognitionStatus = 'Pending';
    recognitionBg = 'bg-orange';
  } else if (recognitionDetails?.status === 'accepted') {
    recognitionStatus = 'Accepted On';
    recognitionBg = 'bg-green';
  } else {
    recognitionStatus = 'Declined On';
    recognitionBg = 'bg-red';
  }

  return (
    <>
      {showPreview && (
        <CreationPreview
          id={recognitionDetails?.creation?.creation_id}
          title={recognitionDetails?.creation?.creation_title}
          description={recognitionDetails?.creation?.creation_description}
          link={recognitionDetails?.creation?.creation_link}
          authorName={recognitionDetails?.creation?.author?.user_name}
          authorProfileId={recognitionDetails?.creation?.author?.user_id}
          date={moment(recognitionDetails?.creation?.creation_date).format('DD/MM/YYYY')}
          materials={recognitionDetails?.creation?.materials?.map((x) => ({
            title: x?.material_title,
            fileType: x?.material_type,
            link: x?.material_link,
            authorName: x?.author?.user_name,
            authorProfileId: x?.author?.user_id,
          }))}
          onClose={() => setShowPreview(false)}
        />
      )}
      {showSocialMediaSharePreview && (
        <SocialMediaModal
          subjectTitle="Recognitions"
          onClose={() => setShowSocialMediaSharePreview(false)}
          shareUrl={shareUrl}
        />
      )}
      {isUpdatingRecognition && <Loader withBackdrop size="large" />}

      {(updatedRecognitionStatus.success || updatedRecognitionStatus.error) && (
        <Snackbar
          open
          onClose={resetUpdateRecognitionStatus}
        >
          <Alert
            onClose={resetUpdateRecognitionStatus}
            icon={false}
            className={updatedRecognitionStatus.success ? 'bg-green color-white' : 'bg-red color-white'}
            sx={{ width: '100%' }}
          >
            {updatedRecognitionStatus.success ? 'Status Accepted!' : updatedRecognitionStatus.error}
          </Alert>
        </Snackbar>
      )}
      <Grid item xs={12}>
        <Grid item xs={12}>
          <Typography className="litigationCloseTitle" variant="h6">
            {user?.user_id === recognitionDetails?.recognition_for?.user_id ? 'You were ' : recognitionDetails?.recognition_for?.user_name}
            {' '}
            recognized by
            {' '}
            {recognitionDetails?.recognition_by?.user_name}
            {' '}
            for
            {' '}
            {recognitionDetails?.material?.material_title}
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
              <img alt="collection-card-hero" src={recognitionDetails?.material?.material_link} />
            )}
            {mediaType === 'video' && (
              <video
                src={recognitionDetails?.material?.material_link}
                preload="metadata"
                controls
              />
            )}
            {mediaType === 'audio' && (
              <audio src={recognitionDetails?.material?.material_link} controls />
            )}
            {(mediaType === 'document' && recognitionDetails?.material?.material_link?.includes('.pdf')) && (
              <embed src={recognitionDetails?.material?.material_link} />
            )}
            {mediaType === 'document' && !recognitionDetails?.material?.material_link?.includes('.pdf') && (
              <div className="unsupported-file-type">
                <h4 className="heading h4">Are you okay to download this file?</h4>
                <a href={mediaType}>{recognitionDetails?.material?.material_link}</a>
                <div className="media-preview-content-options">
                  <Button
                    className="btn btn-primary icon-btn"
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    onClick={() => window.open(recognitionDetails?.material?.material_link)}
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
            <Link to={`/wallet/${recognitionDetails?.recognition_by?.user_id}`}>
              <img
                alt=""
                className="profile-pic profile-pic-small profile-pic-rounded"
                // eslint-disable-next-line unicorn/prefer-module
                src={recognitionDetails?.recognition_by?.image_url || require('assets/images/profile-placeholder.png')}
              />
            </Link>
            <p>
              Recognized by
              {' '}
              <Link to={`/wallet/${recognitionDetails?.recognition_by?.user_id}`}>
                {recognitionDetails?.recognition_by?.user_name}
              </Link>
            </p>
          </div>
          <Chip style={{ fontSize: '16px', margin: 0 }} className="mr-auto bg-orange color-white" label={`Recognized on ${moment(recognitionDetails?.recognition_issued).format('DD/MM/YYYY')}`} />
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
          {recognitionDetails?.status === 'pending'
            && user?.user_id === recognitionDetails?.recognition_for?.user_id
            ? (
              <>
                <Typography className="litigationCloseTitle" variant="h6">
                  Pending Actions
                </Typography>
                <Button
                  className="btn bg-green color-white"
                  onClick={async () => await updateRecognitionStatus(
                    {
                      recognitionId: recognitionDetails.recognition_id,
                      updatedStatus: 'accepted',
                    },
                  )}
                >
                  Accept Authorship
                </Button>
                <Button
                  className="btn bg-red color-white"
                  onClick={async () => await updateRecognitionStatus({
                    recognitionId: recognitionDetails.recognition_id,
                    updatedStatus: 'declined',
                  })}
                >
                  I&apos;m not the author
                </Button>
              </>
            )
            : (
              <Chip
                style={{ fontSize: '16px', margin: 0, marginLeft: 'auto' }}
                className={`mr-auto color-white ${recognitionBg}`}
                label={`${recognitionStatus} ${moment(recognitionDetails?.status_updated).format('DD/MM/YYYY')}`}
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
          <div>
            <ShareButton
              onClick={() => setShowSocialMediaSharePreview(true)}
            />
            <PreviewButton
              onClick={() => setShowPreview(true)}
            />
          </div>
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
              <img alt="collection-card-hero" src={recognitionDetails?.creation?.creation_link} />
            )}
            {creationMediaType === 'video' && (
              <video
                src={recognitionDetails?.creation?.creation_link}
                preload="metadata"
                controls
              />
            )}
            {creationMediaType === 'audio' && (
              <audio src={recognitionDetails?.creation?.creation_link} controls />
            )}
            {(creationMediaType === 'document' && recognitionDetails?.creation?.creation_link?.includes('.pdf')) && (
              <embed src={recognitionDetails?.creation?.creation_link} />
            )}
            {creationMediaType === 'document' && !recognitionDetails?.creation?.creation_link?.includes('.pdf') && (
              <div className="unsupported-file-type">
                <h4 className="heading h4">Are you okay to download this file?</h4>
                <a href={creationMediaType}>{recognitionDetails?.creation?.creation_link}</a>
                <div className="media-preview-content-options">
                  <Button
                    className="btn btn-primary icon-btn"
                    // eslint-disable-next-line security/detect-non-literal-fs-filename
                    onClick={() => window.open(recognitionDetails?.creation?.creation_link)}
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
          <Link
            to={`/creations/${recognitionDetails?.creation?.creation_id}`}
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
          </Link>
        </Grid>
      </Grid>
    </>
  );
}
