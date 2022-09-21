import {
  Grid, Button, Chip, Typography,
} from '@mui/material';
import './Wallet.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';

function Wallet() {
  const navigate = useNavigate();

  const handleClickNewCollection = () => {
    navigate('/scenario-1/create-collection');
  };

  const handleClickSeeCollection = () => {
    navigate('/creations');
  };

  return (
    <div>
      <div className="inner-div">
        <div className="inner-heading">
          <b>My Wallet</b>
          <button>Switch wallet</button>
        </div>
        <div className="front">
          <div className="front__bkg-photo" />
          <div className="front__face-photo" />
          <Grid item className="userDetailsLeft">
            <div className="userDetailsLeftHeader">
              <Typography variant="h4">John Doe</Typography>
              <Typography variant="p">User experience designer</Typography>
            </div>

            <div className="userDetailsChip">
              <Chip className="chip" label="Author of 10 Creations" />
            </div>
          </Grid>
          <Grid container className="userDetails">
            <Grid item md={12} spacing={5} className="userDetailsRight">
              <Button className="collectionButton" onClick={handleClickSeeCollection}>
                View My Creations
              </Button>

              <Button className="collectionButton2" onClick={handleClickNewCollection}>
                Create a New Creation
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
