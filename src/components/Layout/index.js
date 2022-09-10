import React from 'react';
import Footer from './Footer';
import Header from './Header';
import SideBar from './Sidebar';

import { Grid } from '@mui/material';
import TrandingNews from '../TrandingNews/index';
import './Layout.css';

function MainLayout({ children }) {
  return (
    <>
      <Grid className='layout'>
        <Header />
        <Grid container spacing={4}>
          <Grid item md={2.5} className='sidebarResponsive'>
            <SideBar /> 
          </Grid>
          <Grid item md={9.5} xs={12} sm={12}>
            <Grid container>
              <Grid item xs={12}>
                {children}
              </Grid>
              <Grid item xs={12}>
                <TrandingNews />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Footer />
    </>
  );
}

export default MainLayout;