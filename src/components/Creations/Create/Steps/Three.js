import React from 'react';
import {
  Button, Grid, TextField, Typography, Box,
} from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import QrCode from '../../../../assets/qr.png';
import GreenRightIcon from '../../../../assets/green-right.png';

export default function StepThree({
  onBack = () => {}, onComplete = () => {}, status = {}, loading = false,
}) {
  return (
    <Grid item xs={12}>
      <Grid container className="create-collection responsiveCreateCollectionBox">

        <Grid container item md={7} xs={12}>
          <Grid md={3} xs={12} paddingRight="12px">
            <Typography className="heading">Creation Data</Typography>
          </Grid>
          <Grid md={9} xs={12} marginTop={{ xs: '12px', md: '0px' }}>
            <Button className="transparentGreenButton">
              <img src={GreenRightIcon} alt="green-right" />
              {' '}
              Filled
            </Button>
          </Grid>

          <Grid md={3} xs={12} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Typography className="heading">Self Sign</Typography>
          </Grid>
          <Grid md={9} xs={12} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
            <Button className="nextCollectionButton signInCollectionButton">
              Signin
            </Button>
            <Button className="transparentGreenButton transparentGreenVerificationButton">
              <img src={GreenRightIcon} alt="green-right" />
              {' '}
              <span> Verification </span>
            </Button>
          </Grid>

          <Grid md={3} xs={12} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="flex-start">
            <Typography className="heading">Store</Typography>
          </Grid>
          <Grid md={9} xs={12} marginTop={{ xs: '12px', md: '18px' }}>
            <TextField
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              className="input input-dark"
              fullWidth
              placeholder="IPFS"
            />

            <TextField
              style={{ marginTop: '18px' }}
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              className="input input-dark"
              fullWidth
              placeholder="Youtube"
            />

            <div className="create-collection-verify-box" style={{ marginTop: '18px' }}>
              <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
            </div>
          </Grid>
        </Grid>

        <Grid item md={5} xs={12} padding={4} display="flex" flexDirection="column" gap="8px" alignItems="center">
          <Typography variant="h4" className="heading h4">Current QR Code</Typography>
          <div className="create-collection-qrcode">
            <img alt="qr" src={QrCode} />
          </div>
        </Grid>

        <Grid xs={12} md={3} lg={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center" />
        <Grid xs={12} md={9} lg={10} marginTop={{ xs: '12px', md: '18px' }}>
          {(status.error || status.success)
            && (
            <Box width="100%" className={`${status.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px">
              {status.success ? 'Success! A new creation was made' : status.error}
            </Box>
            )}
        </Grid>

      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button className="backCollectionButton" onClick={onBack}>Back</Button>
        <Button disabled={loading} type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto' }} onClick={onComplete}>
          {!loading ? 'Finish'
            : <div className="loader" />}
        </Button>
      </Grid>
    </Grid>
  );
}
