import React, { Component } from 'react';
import Footer from './Footer';
import HomeHeader from './HomeHeader';

import './Layout.css';
import { Grid } from '@mui/material';

function HomeLayout({ children }) {
  return (
    <>
      <Grid className='layout'>
        <HomeHeader />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

export default HomeLayout;