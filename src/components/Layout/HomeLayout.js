import './Layout.css';
import { Grid } from '@mui/material';
import React from 'react';
import Footer from './Footer/Footer';
import Header from './Header/Header';

function HomeLayout({ children }) {
  return (
    <>
      <Grid className='layout'>
        <Header displayNav />
        <Grid container spacing={4}>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>
        <Footer />
      </Grid>
    </>
  );
}

export default HomeLayout;