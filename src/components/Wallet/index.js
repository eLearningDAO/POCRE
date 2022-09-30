import {
  Grid, Button, Chip, Typography,
} from '@mui/material';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Wallet.css';

function Wallet() {
  const navigate = useNavigate();

  const handleClickNewCreation = () => {
    navigate('/creations/create');
  };

  const handleClickSeeCreation = () => {
    navigate('/creations');
  };

  return (
    <div>
      <div className="wallet-div">
        <div className="inner-heading">
          <b>My Wallet</b>
          <button>Switch wallet</button>
        </div>
        <div className="front">
          <div className="front__bkg-photo" />
          <Grid direction="row" className="Wallet--container">
            <Grid item className="userDetailsLeft" style={{ position: 'relative', width: '400px' }}>
              <div className="userDetailsLeftHeader">
                <div className="Wallet--profile-pic">
                  <img src="https://robohash.org/3434" alt="prop avatar" />
                </div>
                <Typography variant="h4">John Doe</Typography>
                <Typography variant="p">User experience designer</Typography>
              </div>
              <div className="userDetailsChip">
                <Chip className="chip" label="Author of 10 Creations" />
              </div>
            </Grid>
            <Grid item className="userDetailsLeft" style={{ position: 'relative', width: '400px' }}>
              <div className="Wallet__rating--container">
                <Chip className="chip" label="Wallet rating" style={{ padding: 20, color: 'white', fontWeight: 600 }} />
                <Chip className="chip" label="Wallet rating" style={{ padding: 20, color: 'white', fontWeight: 600 }} />
              </div>
            </Grid>
            <Grid item className="userDetailsLeft" style={{ position: 'relative', width: '300px', left: '150px' }}>
              <div className="Wallet__verification--container">
                <div className="Wallet__verification--email">
                  twitch@gmail.com
                </div>
                <div className="Wallet__verification--phone">
                  <img src="https://www.dlf.pt/png/big/1/13075_false-png.png" alt="unverified" width={20} height={20} /> 
                  no phone verified
                </div>
                <div className="Wallet__verification--id">
                  ID verified
                </div>
                <div className="Wallet__verification--time">
                  1 week
                </div>
              </div>
            </Grid>
          </Grid>
          <Grid container className="userDetails">
            <Grid item md={12} spacing={5} className="userDetailsRight">
              <Button className="collectionButton" onClick={handleClickSeeCreation}>
                <svg width="62" height="63" viewBox="0 0 62 63" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.42616 46.3589C7.32032 47.253 7.32032 48.7022 6.42616 49.6272C5.96365 50.0589 5.37783 50.3055 4.79199 50.3055C4.17533 50.3055 3.5895 50.0589 3.15783 49.6272C1.21533 47.6847 0.166992 45.1563 0.166992 42.443V10.9005C0.166992 5.31971 4.73035 0.756348 10.3112 0.756348H41.8536C44.9061 0.756348 47.7737 2.11305 49.6853 4.45639C50.5178 5.44305 50.3636 6.92304 49.377 7.72471C48.3903 8.52638 46.9411 8.37219 46.1086 7.41636C45.0603 6.12136 43.5186 5.38135 41.8536 5.38135H10.3112C7.28952 5.38135 4.79199 7.84804 4.79199 10.9005V42.443C4.79199 43.923 5.37782 45.3105 6.42616 46.3589Z" fill="white" />
                  <path d="M51.6891 10.5918H20.1466C14.5658 10.5918 10.0024 15.1552 10.0024 20.736V52.2784C10.0024 57.8593 14.5658 62.4226 20.1466 62.4226H51.6891C57.2699 62.4226 61.8333 57.8593 61.8333 52.2784V20.736C61.8333 15.1552 57.2699 10.5918 51.6891 10.5918ZM26.0974 20.551C28.4408 20.551 30.3525 22.4626 30.3525 24.8368C30.3525 27.2109 28.4408 29.1227 26.0974 29.1227C23.7233 29.1227 21.8116 27.2109 21.8116 24.8368C21.8116 22.4626 23.7233 20.551 26.0974 20.551ZM57.2083 52.2784C57.2083 55.3309 54.7416 57.7976 51.6891 57.7976H20.1466C17.0941 57.7976 14.6274 55.3309 14.6274 52.2784V51.3535L22.9832 43.0284C23.5999 42.3809 24.6483 42.3809 25.265 43.0284L27.5775 45.3409C29.9208 47.6843 34.0524 47.6843 36.3958 45.3409L46.5707 35.166C47.1874 34.5493 48.2666 34.5493 48.8832 35.166L57.2083 43.4909V52.2784Z" fill="white" />
                </svg>

                View my creations
              </Button>

              <Button className="collectionButton2" onClick={handleClickNewCreation}>
                <svg width="55" height="56" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M52.9268 6.90052C55.6123 9.58499 55.6123 13.942 52.9268 16.6276L47.3301 22.2243L33.3652 8.26263L38.9619 2.66488C41.6475 -0.0204541 46.0088 -0.0204541 48.6943 2.66488L52.9268 6.90052ZM25.792 12.9323C24.8789 11.9225 23.2461 11.9225 22.2363 12.9323L11.1826 23.8034C10.2695 24.8991 8.63673 24.8991 7.63019 23.8034C6.62364 22.8903 6.62364 21.2575 7.63019 20.2477L18.5947 9.28744C21.6133 6.26673 26.5117 6.26673 29.5303 9.28744L44.8916 24.652L24.6533 44.901C19.4971 50.0573 12.9229 53.57 5.76857 54.9987L3.08409 55.5358C2.23868 55.7076 1.36427 55.4391 0.755186 54.7409C0.145674 54.2252 -0.118906 53.3551 0.0500687 52.5065L0.587071 49.8209C2.01739 42.6666 5.53439 36.0924 10.6928 30.9362L27.2959 14.3395L25.792 12.9323Z" fill="url(#paint0_linear_166_1939)" />
                  <defs>
                    <linearGradient id="paint0_linear_166_1939" x1="-14.5727" y1="-20.4781" x2="53.8109" y2="-3.32871" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FECE76" />
                      <stop offset="1" stopColor="#F78B88" />
                    </linearGradient>
                  </defs>
                </svg>

                Create a new creation
              </Button>
            </Grid>
          </Grid>
        </div>
      </div>
    </div>
  );
}

export default Wallet;
