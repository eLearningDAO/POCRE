import React from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import QrCode from '../../../assets/qr.png';
import GreenRightIcon from '../../../assets/green-right.png';

export default function StepThree() {
 return (
    <Grid item xs={12}>
        <Grid container className='createCollectionBox responsiveCreateCollectionBox'>

            <Grid container item md={7} xs={12}>
                <Grid md={3} xs={12}>
                    <Typography className='collectionFieldTitle'>Collection Data</Typography>
                </Grid>
                <Grid md={9} xs={12}>
                    <Button className='transparentGreenButton'>
                        <img src={GreenRightIcon} alt='green-right' /> Filled
                    </Button>
                </Grid>

                <Grid md={3} xs={12} className='collectionStoreBoxFields'>
                    <Typography className='collectionFieldTitle'>Self Sign</Typography>
                </Grid>
                <Grid md={9} xs={12} className='collectionStoreBoxFields'>
                    <Button className='nextCollectionButton signInCollectionButton'>
                        Signin
                    </Button>
                    <Button className='transparentGreenButton transparentGreenVerificationButton'>
                        <img src={GreenRightIcon} alt='green-right' /> <span> Verification </span>
                    </Button>
                </Grid>

                <Grid md={3} xs={12} className='collectionStoreBoxFields'>
                    <Typography className='collectionFieldTitle'>Store</Typography>
                </Grid>
                <Grid md={9} xs={12} >
                    <TextField
                        variant="standard"           
                        InputProps={{
                            disableUnderline: true,
                            style: { padding: '8px 20px' },
                        }} className='collectionField collectionStoreBoxFields' fullWidth placeholder="IPFS" />


                    <TextField
                        variant="standard"           
                        InputProps={{
                            disableUnderline: true,
                            style: { padding: '8px 20px' },
                        }} className='collectionField collectionStoreBoxFields' fullWidth placeholder="Youtube" />

                    <div className='humanCheckbox collectionStoreBoxFields'>
                        <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
                    </div>
                </Grid>
            </Grid>

            <Grid item md={4} xs={12} className='qrSectionDiv'>
                <Typography variant='h6' className='qrCodeTitle'>Current QR Code</Typography>
                <div className='qrSection'>
                    <img alt='qr' src={QrCode} />
                </div>
            </Grid>
            
        </Grid>
    </Grid>
  );
};
