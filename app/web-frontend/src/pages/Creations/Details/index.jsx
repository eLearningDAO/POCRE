/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable jsx-a11y/media-has-caption */
/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Alert, Box, Button, Chip, Grid, Snackbar, Typography,
} from '@mui/material';
import PencilIcon from 'assets/images/pencil.png';
import PreviewIcon from 'assets/images/preview.png';
import ShareIcon from 'assets/images/share.png';
import DeleteIconSVG from 'assets/svgs/delete.svg';
import { DeleteCofirmationDialog } from 'components/cards/CreationCard';
import MaterialCard from 'components/cards/MaterialCard';
import MediaBlock from 'components/media/block';
import CreationPreview from 'components/previews/CreationPreview';
import SocialMediaModal from 'components/shared/socialmediaSharingModal';
import Loader from 'components/uicore/Loader';
import moment from 'moment';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import useCreationDelete from '../common/hooks/useCreationDelete';
import useCreationPublish from '../common/hooks/useCreationPublish';
import './index.css';
import useDetails from './useDetails';

const user = authUser.getUser();

export default function CreationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

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
  } = useDetails();

  const {
    isDeletingCreation,
    deleteCreationStatus,
    deleteCreation,
    resetDeletionErrors,
  } = useCreationDelete();

  const {
    isPublishingCreation,
    publishCreationStatus,
    publishCreation,
    resetPublishErrors,
  } = useCreationPublish();

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
    if (creation?.is_draft && !(user?.user_id === creation?.author?.user_id)) {
      // redirect to 404 if creation is in draft status
      navigate('/404');
    }
  }, [creation]);

  useEffect(() => {
    if (deleteCreationStatus.success) {
      navigate('/creations');
    }
  }, [deleteCreationStatus.success]);

  useEffect(() => {
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
    await deleteCreation(id);
  };

  const isProcessingPublishingPayment = (creation?.transactions || [])?.find(
    (t) => !t.is_validated
      && t.transaction_purpose === transactionPurposes.PUBLISH_CREATION,
  );

  return (
    <Grid item xs={12}>
      {(isDeletingCreation || isPublishingCreation) && <Loader withBackdrop size="large" />}
      {(deleteCreationStatus.success || deleteCreationStatus.error) && (
        <Snackbar open onClose={resetDeletionErrors}>
          <Alert
            onClose={resetDeletionErrors}
            severity={deleteCreationStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {deleteCreationStatus.success || deleteCreationStatus.error}
          </Alert>
        </Snackbar>
      )}
      {(publishCreationStatus.success || publishCreationStatus.error) && (
        <Snackbar open onClose={resetPublishErrors}>
          <Alert
            onClose={resetPublishErrors}
            severity={publishCreationStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {publishCreationStatus.success || publishCreationStatus.error}
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
          ipfsHash={creation?.ipfs_hash}
          date={moment(creation?.creation_date).format('Do MMMM YYYY')}
          authorName={creation?.author?.user_name}
          authorProfileId={creation?.author?.user_id}
          finalizationDate={moment(creation?.creation_authorship_window).format('Do MMMM YYYY')}
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
        <MediaBlock mediaType={creation?.creation_type} mediaUrl={creation?.creation_link} />
      </Grid>

      <Grid
        display="flex"
        gap="12px"
        justifyContent="flex-end"
        marginTop="18px"
        width="100%"
      >
        {user?.user_id === creation?.author?.user_id
          && !creation?.is_draft
          && !creation?.is_fully_owned
          && moment().isAfter(moment(creation?.creation_authorship_window))
          && (
            <Button
              className="approveButton"
              onClick={async () => await publishCreation({
                id: creation?.creation_id,
                ipfsHash: creation?.ipfs_hash,
              })}
            >
              Finalize
            </Button>
          )}

        {
          user?.user_id === creation?.author?.user_id
          && creation?.is_draft
          && !isProcessingPublishingPayment
          && (
            <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onEditClick}>
              <img src={PencilIcon} alt="" />
            </Button>
          )
        }

        {user?.user_id === creation?.author?.user_id && (
          <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onDeleteClick}>
            <img src={DeleteIconSVG} alt="" />
          </Button>
        )}

        <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onPreviewClick}>
          <img src={PreviewIcon} alt="" width={26} />
        </Button>
        {!creation?.is_draft && (
          <Button className="collection-card-action-btn collection-card-action-btn-border-dark" onClick={onShareClick}>
            <img src={ShareIcon} alt="" />
          </Button>
        )}
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
              {!creation.is_draft && <Chip className="mr-auto bg-black color-white" label={`Finalization on: ${moment(creation?.creation_authorship_window).format('Do MMMM YYYY')}`} />}
              {isProcessingPublishingPayment && <Chip className="mr-auto bg-black color-white" label="Pending payment verifcation to publish" />}
              <Chip className="mr-auto bg-black color-white" label={`Unique ID: ${creation?.creation_id}`} />
              {!creation?.is_draft && creation?.is_fully_owned && <Chip className="mr-auto bg-black color-white" label="Published" />}
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
                mediaType={x?.material_type}
                isClaimable={x?.is_claimable}
                link={x?.material_link}
                title={x?.material_title}
                description={x?.material_description}
                username={x?.author?.user_name}
                userimage={x?.author?.image_url}
                userProfileId={x?.author?.user_id}
                canClaim={!creation?.is_draft}
                onQuickClaim={() => {
                  navigate(`/litigations/create?creationId=${id}&materialId=${x?.material_id}`);
                }}
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
