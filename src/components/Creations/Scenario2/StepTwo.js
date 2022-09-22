import { Grid } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import React from 'react';
import UserCard from '../../cards/UserCard';

export default function StepTwo() {
  return (
    <Grid item xs={12}>
      <Grid justifyContent="center" container className="createCollectionBox collectionBoxStep2 createCollectionBoxScenario2Step2">
        <Grid display="flex" alignItem="flex-top" gap="24px">
          <UserCard />
          <UserCard variant="secondary" totalCreationsAuthored={1} />
        </Grid>

        <Grid md={4} xs={8} sm={8} justifyContent="center" container>
          <div className="collectionStoreBoxFields">
            <FormControlLabel control={<Checkbox />} label="Send Alart for pacific Reconciliation" />
          </div>
          <div className="humanCheckbox collectionStoreBoxFields">
            <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
          </div>
        </Grid>
      </Grid>
    </Grid>
  );
}
