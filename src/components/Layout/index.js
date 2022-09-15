import './Layout.css';
import { Grid } from '@mui/material';
import React from 'react';
import TrandingNews from '../TrandingNews/index';
import Footer from './Footer/Footer';
import Header from './Header/Header';
import SideBar from './Sidebar/Sidebar';

function Layout({ children, displayNav, displaySidebar }) {
  return (
    <>
      <Grid className="layout">
        <Header displayNav={displayNav} />

        {displaySidebar ? <Grid container spacing={{ md: 2, lg: 4 }} marginTop="8px">
          <Grid item md={3}
            marginTop="52px"
            display={{ xs: 'none', sm: 'none', md: 'inherit' }}
          >
            <SideBar />
          </Grid>
          <Grid item xs={12} md={9}>
            <Grid container>
              <Grid item xs={12}>
                {children}
              </Grid>
              <Grid item xs={12}>
                <TrandingNews />
              </Grid>
            </Grid>
          </Grid>
        </Grid> : <Grid container>
          <Grid item xs={12}>
            {children}
          </Grid>
        </Grid>}
        <Footer />
      </Grid>
    </>
  );
}

export default Layout;
