import React from 'react';
import { Button, Grid, TextField, Typography } from '@mui/material';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import UserCard1 from '../UserCard1';
import UserCard2 from '../UserCard2';

export default function StepTwo() {
 return (
    <Grid item xs={12}>
        <Grid justifyContent="center" container className='createCollectionBox collectionBoxStep2 createCollectionBoxScenario2Step2'>
            <Grid xs={12} sm={12} md={6}>
                <UserCard1 />
            </Grid>
            <Grid xs={6} className='responsive'>
                <UserCard2 />
            </Grid>

            <Grid md={4} xs={8} sm={8} justifyContent="center" container>
                <div className='collectionStoreBoxFields'>
                    <FormControlLabel control={<Checkbox />} label="Send Alart for pacific Reconciliation" />
                </div>
                <div className='humanCheckbox collectionStoreBoxFields'>
                    <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
                </div>
            </Grid>
        </Grid>
    </Grid>
  );
};
