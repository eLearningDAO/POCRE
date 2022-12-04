/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Chip, Grid,
  Typography, Box, Button,
  Alert, Snackbar,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import MaterialCard from 'components/cards/MaterialCard';
import Loader from 'components/uicore/Loader';
import './index.css';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import DownloadIconSVG from 'assets/svgs/download.svg';
import PencilIcon from 'assets/images/pencil.png';
import ShareIcon from 'assets/images/share.png';
import DeleteIconSVG from 'assets/svgs/delete.svg';
import PreviewIcon from 'assets/images/previewicons.png';
import SocialMediaModal from 'components/shared/socialmediaSharingModal';
import CreationPreview from 'components/previews/CreationPreview';
import { DeleteCofirmationDialog } from 'components/cards/CreationCard';
import authUser from 'utils/helpers/authUser';
import useDetails from './useDetails';

const user = authUser.getUser();

export default function CreationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mediaType, setMediaType] = useState(null);
  const [qrcodeBase64, setQrcodeBase64] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(null);
  const [showCreationDetailsPreview, setShowCreationDetailsPreview] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(null);

  const onEditClick = () => navigate(`/creations/${id}/update`);
  const onDeleteClick = () => setShowDeleteConfirmation(true);
  const onShareClick = () => setShowShareOptions(true);
  const onPreviewClick = () => setShowCreationDetailsPreview(true);

  const {
    creation,
    fetchCreationDetails,
    fetchCreationStatus,
    isFetchingCreation,
    isDeletingCreation,
    deleteCreationStatus,
    deleteCreation,
    resetDeletionErrors,
  } = useDetails();

  const generateQRCodeBase64 = async (text) => {
    const code = await QRCode.toDataURL(`${window.location.origin}/creations/${text}`, {
      width: 150,
      height: 150,
      margin: 2,
      scale: 8,
    });

    setQrcodeBase64(code);
  };

  useEffect(() => {
    if (id) fetchCreationDetails(id);
  }, [id]);

  useEffect(() => {
    if (deleteCreationStatus.success) {
      navigate('/creations');
    }
  }, [deleteCreationStatus.success]);

  useEffect(() => {
    const x = getUrlFileType(creation?.creation_link);
    setMediaType(x);
    if (creation?.creation_id) generateQRCodeBase64(creation?.creation_id);
  }, [creation]);

  if (isFetchingCreation) return <Loader />;

  if (fetchCreationStatus.error) {
    return (
      <h2 className="color-red">
        {fetchCreationStatus.error}
      </h2>
    );
  }

  const handleDelete = async () => {
    setShowDeleteConfirmation(false);
    await deleteCreation();
  };

  return (
    <Grid item xs={12}>
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
      {showShareOptions && (
        <SocialMediaModal
          onClose={() => setShowShareOptions(false)}
          shareUrl={`${window.location.origin}/creations/${id}`}
        />
      )}
      {showCreationDetailsPreview && (
        <CreationPreview
          id={creation?.creation_id}
          title={creation?.creation_title}
          description={creation?.creation_description}
          link={creation?.creation_link}
          date={moment(creation?.creation_date).format('Do MMMM YYYY')}
          authorName={creation?.author?.user_name}
          authorProfileId={creation?.author?.user_id}
          materials={(creation?.materials || [])?.map((x) => ({
            title: x?.material_title,
            fileType: x?.material_type,
            link: x?.material_link,
            authorName: x?.author?.user_name,
            authorProfileId: x?.author?.user_id,
          }))}
          onClose={() => setShowCreationDetailsPreview(false)}
        />
      )}
      {showDeleteConfirmation && (
        <DeleteCofirmationDialog
          onClose={() => setShowDeleteConfirmation(false)}
          onConfirm={handleDelete}
        />
      )}
      <Grid item xs={12}>
        <Typography className="litigationCloseTitle" variant="h6">
          Creation -
          {' '}
          {creation?.creation_title}
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
            <img alt="collection-card-hero" src={creation?.creation_link} />
          )}
          {mediaType === 'video' && (
            <video
              src={creation?.creation_link}
              preload="metadata"
              controls
            />
          )}
          {mediaType === 'audio' && (
            <audio src={creation?.creation_link} controls />
          )}
          {(mediaType === 'document' && creation?.creation_link?.includes('.pdf')) && (
            <embed src={creation?.creation_link} />
          )}
          {mediaType === 'document' && !creation?.creation_link?.includes('.pdf') && (
            <div className="unsupported-file-type">
              <h4 className="heading h4">Are you okay to download this file?</h4>
              <a href={creation?.creation_link}>{creation?.creation_link}</a>
              <div className="media-preview-content-options">
                <Button
                  className="btn btn-primary icon-btn"
                  // eslint-disable-next-line security/detect-non-literal-fs-filename
                  onClick={() => window.open(creation?.creation_link)}
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
        justifyContent="flex-end"
        marginTop="18px"
        width="100%"
      >
        {user?.user_id === creation?.author?.user_id && creation?.is_draft && (
        <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onEditClick}>
          <img src={PencilIcon} alt="" />
        </Button>
        )}

        {user?.user_id === creation?.author?.user_id && (
        <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onDeleteClick}>
          <img src={DeleteIconSVG} alt="" />
        </Button>
        )}

        <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onPreviewClick}>
          <img src={PreviewIcon} alt="" width={26} />
        </Button>

        <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onShareClick}>
          <img src={ShareIcon} alt="" />
        </Button>
      </Grid>

      <Grid
        display="flex"
        gap="12px"
        alignItem="flex-top"
        marginTop="18px"
        width="100%"
      >
        <Box
          display="flex"
          flexDirection="column"
          gap="12px"
          width="100%"
          className="creation-author"
        >
          <Box
            display="flex"
            gap="12px"
            alignItem="center"
            justifyContent="space-between"
            width="100%"
            className="creation-author"
          >
            <img
              className="creation-user-image"
              // eslint-disable-next-line unicorn/prefer-module
              src={creation?.author?.image_url || require('assets/images/profile-placeholder.png')}
              alt=""
            />
            <Box
              display="flex"
              flexDirection="column"
              gap="5px"
              alignItem="center"
              width="fit-content"
              marginLeft="0"
              marginRight="auto"
            >
              <h4 className="h4">
                <Link to={`/wallet/${creation?.author?.user_id}`}>
                  {creation?.author?.user_name}
                </Link>
              </h4>
              <Chip className="mr-auto bg-orange-dark color-white" label={`Created on ${moment(creation?.creation_date).format('DD/MM/YYYY')}`} />
              <Chip className="mr-auto bg-black color-white" label={`Unique ID: ${creation?.creation_id}`} />
            </Box>
          </Box>
          {creation?.creation_description && (
            <Typography variant="p">
              {creation?.creation_description}
            </Typography>
          )}
        </Box>
        <img className="creation-qr-code" src={qrcodeBase64} alt="QR Code" />
      </Grid>

      {creation?.materials?.length > 0 && (
        <>

          <Grid item xs={12} marginTop="24px">
            <Typography className="litigationCloseTitle" variant="h4">
              Materials Used (
              {creation?.materials?.length}
              )
            </Typography>
          </Grid>

          <Grid display="flex" flexDirection="column" gap="12px" marginTop="12px" width="100%">
            {creation?.materials?.map((x, index) => (
              <MaterialCard
                key={index}
                mediaUrl={x?.material_link}
                link={x?.material_link}
                title={x?.material_title}
                description={x?.material_description}
                username={x?.author?.user_name}
                userimage={x?.author?.image_url}
                userProfileId={x?.author?.user_id}
                interactionBtns={false}
                showReconcilateOptions={false}
                recognitionStatus={x?.recognition?.status || null}
              />
            ))}
          </Grid>
        </>
      )}

      <Grid item xs={12} marginTop="48px" width="100%">
        <h2 className="header-lines"><span>Tags</span></h2>
      </Grid>

      <Grid
        display="flex"
        alignItems="center"
        justifyContent="center"
        gap="12px"
        marginTop="12px"
        width="100%"
      >
        {creation?.tags?.map((x, index) => (
          <Chip className="bg-orange-dark color-white w-fit" style={{ paddingLeft: '8px', paddingRight: '8px' }} key={index} label={x?.tag_name} />
        ))}
      </Grid>
    </Grid>
  );
}
