import React from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import InviteIcon from '../../../assets/invite-icon.png';

export default function StepTwo() {
 return (
    <Grid item xs={12}>
        <Grid container className='createCollectionBox collectionBoxStep2'>
            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle'>Title</Typography>
            </Grid>
            <Grid xs={12} md={4}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Collection title" />
            </Grid>

            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle leftCollectionTitle'>Source</Typography>
            </Grid>
            <Grid xs={12} md={4}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Select.." />
            </Grid>

            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle'>Link</Typography>
            </Grid>
            <Grid md={10} xs={12}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Collection source (Google drive, Youtube, etc)" />
            </Grid>

            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle'>Author</Typography>
            </Grid>
            <Grid xs={6} md={6}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Select.." />
            </Grid>
            <Grid xs={5} md={1.5}>
                <Button className='inviteButton'><img width={17} style={{ marginRight: '10px' }} alt='invite-icon' src={InviteIcon} /> Invite</Button>
            </Grid>
        </Grid>
    </Grid>
  );
};
