import React from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import UserCard1 from '../Creations/UserCard1';
import UserCard2 from '../Creations/UserCard2';

export default function LitigationClosed() {
 return (
    <Grid item xs={12}>
        <Grid item xs={12}>
            <Typography className='litigationCloseTitle' variant='h6'>Litigation- I want to reclaim my authorship of this media</Typography>
        </Grid>

        <Grid justifyContent="center" container className='createCollectionBox collectionBoxStep2 createCollectionBoxScenario2Step2 userClaimAuthorBox'>
            <Grid xs={6}>
                <Grid item xs={12} style={{ marginTop: '10px', marginBottom: '10px' }}>
                    <Typography className='inviationSectionTitle' variant='h6'>Claimer</Typography>
                </Grid>
                <UserCard1 />
            </Grid>
            <Grid xs={6}>
                <Grid item xs={12} style={{ marginTop: '10px', marginLeft: '10px', marginBottom: '10px' }}>
                    <Typography className='inviationSectionTitle' variant='h6'>Assumed Author</Typography>
                </Grid>
                <UserCard2 />
            </Grid>
        </Grid>

        <Grid item xs={12} style={{ marginTop: '40px' }}>
            <Typography className='litigationCloseTitle' variant='h6'>New Collection - Step 02</Typography>
        </Grid>

        <Grid justifyContent="center" container className='createCollectionBox collectionBoxStep2 createCollectionBoxScenario2Step2 userClaimAuthorBox2'>
            <Grid xs={6}>
                <UserCard1 />
            </Grid>
            <Grid xs={6}>
                <UserCard2 />
            </Grid>


            <Grid xs={4} justifyContent="center" container>
                <Button className='seeMoreButton'>See More</Button>
            </Grid>
        </Grid>
    </Grid>
  );
};
