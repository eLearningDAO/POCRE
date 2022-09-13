import './Layout.css';
import { Grid } from '@mui/material';
import React from 'react';
import TrandingNews from '../TrandingNews/index';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import SideBar from './Sidebar';

function MainLayout({ children }) {
  return (
    <>
      <Grid className="layout">
        <Header />

        <Grid container spacing={4}>
          <Grid item md={2.5} className="sidebarResponsive">
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
        <Footer />
      </Grid>
    </>
  );
}

export default MainLayout;
