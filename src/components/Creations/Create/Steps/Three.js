import React from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import QrCode from '../../../../assets/qr.png';
import GreenRightIcon from '../../../../assets/green-right.png';

export default function StepThree() {
    return (
        <Grid item xs={12}>
            <Grid container className='create-collection responsiveCreateCollectionBox'>

                <Grid container item md={7} xs={12}>
                    <Grid md={3} xs={12} paddingRight="12px">
                        <Typography className='heading'>Collection Data</Typography>
                    </Grid>
                    <Grid md={9} xs={12} marginTop={{ xs: "12px", md: "0px" }}>
                        <Button className='transparentGreenButton'>
                            <img src={GreenRightIcon} alt='green-right' /> Filled
                        </Button>
                    </Grid>

                    <Grid md={3} xs={12} marginTop={{ xs: "12px", md: "18px" }} display="flex" flexDirection="row" alignItems="center">
                        <Typography className='heading'>Self Sign</Typography>
                    </Grid>
                    <Grid md={9} xs={12} marginTop={{ xs: "12px", md: "18px" }} display="flex" flexDirection="row" alignItems="center">
                        <Button className='nextCollectionButton signInCollectionButton'>
                            Signin
                        </Button>
                        <Button className='transparentGreenButton transparentGreenVerificationButton'>
                            <img src={GreenRightIcon} alt='green-right' /> <span> Verification </span>
                        </Button>
                    </Grid>

                    <Grid md={3} xs={12} marginTop={{ xs: "12px", md: "18px" }} display="flex" flexDirection="row" alignItems="flex-start">
                        <Typography className='heading'>Store</Typography>
                    </Grid>
                    <Grid md={9} xs={12} marginTop={{ xs: "12px", md: "18px" }}>
                        <TextField
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                            }} className='input input-dark' fullWidth placeholder="IPFS" />


                        <TextField
                            style={{ marginTop: "18px" }}
                            variant="standard"
                            InputProps={{
                                disableUnderline: true,
                            }} className='input input-dark' fullWidth placeholder="Youtube" />

                        <div className='create-collection-verify-box' style={{ marginTop: "18px" }}>
                            <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
                        </div>
                    </Grid>
                </Grid>

                <Grid item md={5} xs={12} padding={4} display="flex" flexDirection="column" gap="8px" alignItems="center">
                    <Typography variant='h4' className='heading h4'>Current QR Code</Typography>
                    <div className='create-collection-qrcode'>
                        <img alt='qr' src={QrCode} />
                    </div>
                </Grid>

            </Grid>
        </Grid>
    );
};
