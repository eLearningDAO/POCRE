import React from 'react';
import { Grid, TextField, Typography } from '@mui/material';

export default function StepOne() {
 return (
    <Grid item xs={12}>
        <Grid container className='createCollectionBox'>
            <Grid xs={12} md={2}>
                <Typography className='collectionFieldTitle'>Title</Typography>
            </Grid>
            <Grid xs={12} md={10}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Collection title" />
            </Grid>

            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle'>Description</Typography>
            </Grid>
            <Grid md={10} xs={12}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField collectionDesc' fullWidth placeholder="Collection description" />
            </Grid>

            <Grid xs={12} md={2}>
                <Typography className='collectionFieldTitle'>Source</Typography>
            </Grid>
            <Grid xs={12} md={10}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Collection source (Google drive, Youtube, etc)" />
            </Grid>

            <Grid md={2} xs={12}>
                <Typography className='collectionFieldTitle'>Tag</Typography>
            </Grid>
            <Grid md={10} xs={12}>
                <TextField
                    variant="standard"           
                    InputProps={{
                        disableUnderline: true,
                        style: { padding: '8px 20px' },
                    }} className='collectionField' fullWidth placeholder="Collection tag (tag input)" />
            </Grid>
        </Grid>
    </Grid>
  );
};
