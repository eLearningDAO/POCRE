/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import {
  Box, Button, Grid, TextField, Typography,
} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Cookies from 'js-cookie';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PreviewIcon from 'assets/svgs/preview.svg';
import SaveIcon from 'assets/svgs/save.svg';
import CreationPreview from 'components/previews/CreationPreview';

// get auth user
const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function dec2hex(dec) {
  return dec.toString(16).padStart(2, '0');
}

function generateId(length_) {
  const array = new Uint8Array((length_ || 40) / 2);
  window.crypto.getRandomValues(array);
  return [...array].map((element) => dec2hex(element)).join('');
}

export default function StepThree({
  onBack = () => {}, onComplete = () => {}, status = {}, loading = false, creationDraft = {},
}) {
  const navigate = useNavigate();

  const [dummyURL, setDummyURL] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const generateDummyURL = () => {
    setDummyURL(`https://ipfs.url.example.com/${generateId()}`);
  };

  return (
    <>
      {showPreview
       && (
       <CreationPreview
         title={creationDraft?.title}
         description={creationDraft?.description}
         link={creationDraft?.source}
         authorName={authUser?.user_name}
         date={creationDraft?.date}
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

          <Grid container item xs={12}>
            <Grid md={3} xs={12} paddingRight="12px" height="fit-content">
              <span className="heading">Creation Date</span>
            </Grid>
            <Grid md={9} xs={12} height="fit-content">
              <span>{new Date().toLocaleDateString()}</span>
            </Grid>

            <Grid md={3} xs={12} marginTop={{ xs: '12px', md: '36px' }} display="flex" flexDirection="row" alignItems="flex-start">
              <Typography className="heading">Store optionally on IPFS</Typography>
            </Grid>
            <Grid md={9} xs={12} marginTop={{ xs: '12px', md: '36px' }}>
              <Grid display="flex" alignItems="flex-start" gap="12px">
                <TextField
                  value={dummyURL}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                  }}
                  className="input input-dark"
                  fullWidth
                  placeholder="IPFS"
                />
                <Button padding="0" minWidth="0" onClick={generateDummyURL}>
                  <img src={SaveIcon} height="36" width="36" alt="" />
                </Button>
              </Grid>
            </Grid>

            <Grid md={3} xs={12} paddingRight="12px" height="fit-content" marginTop={{ xs: '12px', md: '24px' }}>
              <span className="heading">Preview</span>
            </Grid>
            <Grid md={9} xs={12} height="fit-content" marginTop={{ xs: '12px', md: '24px' }}>
              <Button
                padding="0"
                minWidth="0"
                onClick={() => setShowPreview(true)}
              >
                <img src={PreviewIcon} height="36" width="36" alt="" />
              </Button>
            </Grid>

            <Grid md={3} xs={12} paddingRight="12px" height="fit-content" marginTop={{ xs: '12px', md: '18px' }} />
            <Grid md={9} xs={12} height="fit-content" marginTop={{ xs: '12px', md: '18px' }}>
              <div className="create-collection-verify-box" style={{ marginTop: '18px' }}>
                <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
              </div>
            </Grid>
          </Grid>

          <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
          <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
            {(status.error || status.success)
            && (
            <Box width="100%" className={`${status.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px">
              {status.success ? 'Success! A new creation was made. Redirecting...' : status.error}
            </Box>
            )}
          </Grid>

        </Grid>

        <Grid item xs={12} className="collectionButtons">
          {!status?.success
            ? (
              <>
                <Button className="backCollectionButton" onClick={onBack}>Back</Button>
                <Button className="saveDraftButton" style={{ marginLeft: 'auto', marginRight: '12px' }} onClick={() => onComplete({ is_draft: true })}>
                  {!loading ? 'Save Draft'
                    : <div className="loader" />}
                </Button>
                <Button disabled={loading} type="submit" className="nextCollectionButton" onClick={onComplete}>
                  {!loading ? 'Finish'
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
