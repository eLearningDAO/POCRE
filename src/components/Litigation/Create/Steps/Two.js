/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Button, Grid, Box,
} from '@mui/material';
import React, { useState } from 'react';
// import FormControlLabel from '@mui/material/FormControlLabel';
// import Checkbox from '@mui/material/Checkbox';
import LeftIcon from '../../../../assets/left.png';
import RightIcon from '../../../../assets/right.png';
import UserCard from '../../../cards/UserCard';

export default function StepOne({
  onComplete = () => {},
  onBack = () => {},
  status = {},
  loading = false,
  authors = [
  ],
}) {
  const [slideNumber, setSlideNumber] = useState(1);

  const next = () => {
    setSlideNumber((x) => (x === authors.length ? 1 : x + 1));
  };
  const previous = () => {
    setSlideNumber((x) => (x === 1 ? authors.length - 1 : x - 1));
  };

  return (
    <>
      <Grid item xs={12} display="flex" flexDirection="column" justifyContent="center" alignItem="center" gap="24px" padding="24px" className="secondary-section-container">
        {authors.length > 0 && (
        <div className="carousel-container">
          {slideNumber}
          {authors.map((author, index) => (index === slideNumber - 1 || index === slideNumber
            ? (
              <UserCard
                username={author.name}
                imageUrl={author.imageUrl}
                totalCreationsAuthored={Math.floor(Math.random())}
              />
            )
            : null))}
          <div className="carousel-slide-btns-container">
            <Button onClick={previous}><img src={LeftIcon} alt="" /></Button>
            <Button onClick={next}><img src={RightIcon} alt="" /></Button>
          </div>
        </div>
        )}

        <div
          className="voting-msg"
          style={{ margin: 'auto', marginTop: '18px' }}
        >
          <h4 className="h4 mx-auto">
            Voting Process started
          </h4>
        </div>
        {/* <FormControlLabel control={<Checkbox defaultChecked
          onChange={handleInvitationSelectionChange} />}
          label="Send Alart for pacific Reconciliation"
          style={{ margin: 'auto', marginTop: '18px' }} /> */}

        {/* <div className="create-collection-verify-box"
         style={{ margin: 'auto', marginTop: '18px' }}>
          <FormControlLabel control={<Checkbox defaultChecked />} label="I’m human" />
        </div> */}

        {(status.error || status.success)
              && (
              <Box width="100%" className={`${status.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px" style={{ margin: 'auto', marginTop: '18px' }}>
                {status.success ? 'Success! A new litigation was made. Redirecting...' : status.error}
              </Box>
              )}
      </Grid>

      <Grid item xs={12} className="collectionButtons">
        <Button className="backCollectionButton" onClick={onBack}>Back</Button>
        <Button type="submit" className="nextCollectionButton" style={{ marginLeft: 'auto' }} onClick={onComplete}>
          {!loading ? 'Finish'
            : <div className="loader" />}
        </Button>
      </Grid>
    </>
  );
}
