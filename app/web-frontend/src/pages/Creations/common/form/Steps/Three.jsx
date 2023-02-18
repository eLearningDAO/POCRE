/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box, Button, Grid, Typography,
} from '@mui/material';
import PreviewIcon from 'assets/images/preview.png';
import CreationPreview from 'components/previews/CreationPreview';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authUser from 'utils/helpers/authUser';

// get auth user
const user = authUser.getUser();

export default function StepThree({
  creationId = '',
  onBack = () => {},
  onComplete = () => {},
  status = {},
  loading = false,
  creationDraft = {},
}) {
  const navigate = useNavigate();

  const [showPreview, setShowPreview] = useState(false);
  const [qrcodeBase64, setQrcodeBase64] = useState(null);

  const generateQRCodeBase64 = async (text) => {
    const code = await QRCode.toDataURL(`${window.location.origin}/creations/${text}`, {
      width: 250,
      height: 250,
      margin: 2,
      scale: 8,
    });

    setQrcodeBase64(code);
  };

  useEffect(() => {
    if (creationId) generateQRCodeBase64(creationId);
  }, [creationId]);

  return (
    <>
      {showPreview
        && (
          <CreationPreview
            title={creationDraft?.title}
            description={creationDraft?.description}
            link={creationDraft?.source}
            authorName={user?.user_name}
            date={creationDraft?.date}
            ipfsHash={creationDraft?.ipfsHash || 'Available after creation is published'}
            materials={creationDraft?.materials?.map((x) => ({
              title: x?.title,
              fileType: x?.fileType,
              link: x?.link,
              authorName: x?.author,
            }))}
            onClose={() => setShowPreview(false)}
          />
        )}
      <Grid item xs={12}>
        <Grid container className="create-collection" justifyContent="flex-start" height="fit-content">

          <Grid container item md={qrcodeBase64 ? 7 : 12} xs={12}>
            <Grid md={qrcodeBase64 ? 4 : 3} xs={12} paddingRight="12px" height="fit-content">
              <span className="heading">Creation Date</span>
            </Grid>
            <Grid md={qrcodeBase64 ? 8 : 9} xs={12} height="fit-content">
              <span>{new Date().toLocaleDateString()}</span>
            </Grid>

            <Grid md={qrcodeBase64 ? 4 : 3} xs={12} marginTop={{ xs: '12px', md: qrcodeBase64 ? '18px' : '36px' }} display="flex" flexDirection="row" alignItems="flex-start">
              <Typography className="heading">IPFS Hash</Typography>
            </Grid>
            <Grid md={qrcodeBase64 ? 8 : 9} xs={12} marginTop={{ xs: '12px', md: qrcodeBase64 ? '18px' : '36px' }}>
              <Grid display="flex" alignItems="flex-start" gap="12px">
                <Box width="100%" className="bg-black color-white" style={{ wordWrap: 'break-word' }} padding="16px" borderRadius="12px" fontSize="16px">
                  {creationDraft?.ipfsHash || 'Available after creation is published'}
                </Box>
              </Grid>
            </Grid>

            <Grid md={qrcodeBase64 ? 4 : 3} xs={12} paddingRight="12px" height="fit-content" marginTop={!qrcodeBase64 ? { xs: '12px', md: '24px' } : {}}>
              <span className="heading">Preview</span>
            </Grid>
            <Grid md={qrcodeBase64 ? 8 : 9} xs={12} height="fit-content" marginTop={!qrcodeBase64 ? { xs: '12px', md: '24px' } : {}}>
              <Button
                padding="0"
                minWidth="0"
                onClick={() => setShowPreview(true)}
              >
                <img src={PreviewIcon} height="36" width="36" alt="" />
              </Button>
            </Grid>
          </Grid>

          {qrcodeBase64 && (
            <Grid item md={5} xs={12} padding={4} display="flex" flexDirection="column" gap="8px" alignItems="center">
              <Typography variant="h4" className="heading h4">Current QR Code</Typography>
              <div className="create-collection-qrcode">
                <img alt="qr" src={qrcodeBase64} />
              </div>
            </Grid>
          )}

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            {(status.error || status.success)
              && (
                <Box width="100%" className={`${status.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px">
                  {status.success ? (qrcodeBase64 ? 'Success! The creation was published. Redirecting...' : 'Success! A new creation was made. Redirecting...') : status.error}
                </Box>
              )}
          </Grid>

        </Grid>

        <Grid item xs={12} className="collectionButtons">
          {!status?.success
            ? (
              <>
                <Button className="backCollectionButton" onClick={onBack}>Back</Button>
                {!qrcodeBase64 && (
                  <Button className="saveDraftButton" style={{ marginLeft: 'auto', marginRight: '12px' }} onClick={() => onComplete({ is_draft: true })}>
                    {!loading ? 'Save Draft'
                      : <div className="loader" />}
                  </Button>
                )}
                <Button disabled={loading} type="submit" className="nextCollectionButton" onClick={onComplete}>
                  {!loading ? (qrcodeBase64 ? 'Publish' : 'Finish')
                    : <div className="loader" />}
                </Button>
              </>
            ) : (
              <Button className="nextCollectionButton" style={{ marginLeft: 'auto' }} onClick={() => navigate('/creations')}>
                Close
              </Button>
            )}
        </Grid>
      </Grid>
    </>
  );
}
