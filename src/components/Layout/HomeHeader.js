import React, { useState, useEffect } from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import ClearIcon from '@mui/icons-material/Clear';

import logo from "../../assets/logo.png";
import icon1 from "../../assets/icon-1.png";
import icon2 from "../../assets/icon-2.png";

import MenuIcon1 from "../../assets/brick-icon.png";
import MenuIcon2 from "../../assets/book-icon.png";
import MenuIcon3 from "../../assets/envelope-icon.png";
import MenuIcon4 from "../../assets/bank-icon.png";
import MenuIcon5 from "../../assets/wallet-icon.png";
import MenuIcon6 from "../../assets/credit.png";

import MenuIcon1Active from "../../assets/brick-icon-2.png";
import MenuIcon2Active from "../../assets/book-icon-2.png";
import MenuIcon3Active from "../../assets/envelope-icon-2.png";
import MenuIcon4Active from "../../assets/bank-icon-2.png";
import MenuIcon5Active from "../../assets/wallet-icon-2.png";
import MenuIcon6Active from "../../assets/credit-icon-2.png";

import './responsive-menu-transition.css';

import { Button, Grid, TextField } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';

import { CSSTransition } from 'react-transition-group';

const duration = 200000;

const Fade = (props) => {
  return (
    <CSSTransition classNames="alert" in={props.inProp} timeout={duration} unmountOnExit>
      {props.children}
    </CSSTransition>
  );
};

function HomeHeader() {
  const location = useLocation();

  const [displayResponsiveMenu, setDisplayResponsiveMenu] = React.useState(false);

  return (
    <Grid container className='header'>
      <Grid item md={2} className='logoContainer responsive'>
        <Link to="/"><img alt='logo' src={logo} /></Link>
      </Grid>

      <Grid item md={4} className='responsive'>
        <TextField variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { padding: '6px 17px', color: '#32363C' },
          }}
          className='searchBar' fullWidth placeholder="Search for online course" id="fullWidth" />
      </Grid>

      <Grid item md={4} className='responsive'>
        <div className="menu">
          <ul>
            <li className={location.pathname === '/creations'? 'activeSidebarMenu' : ''}><Link  to='/creations'>Creations</Link></li>
            <li className={location.pathname === '/invitation'? 'activeSidebarMenu' : ''} ><Link to='/invitation'>Invitation</Link></li>
            <li className={location.pathname === '/litigation'? 'activeSidebarMenu' : ''} ><Link to='/litigation'>Litigation</Link></li>
            <li className={location.pathname === '/wallet'? 'activeSidebarMenu' : ''} ><Link to='/wallet'>Wallet</Link></li>
            <li className={location.pathname === '/credit'? 'activeSidebarMenu' : ''} ><Link to='/credit'>Credit</Link></li>
          </ul>
        </div>
      </Grid>

      <Grid item xs={6} className='non-responsive responsiveMenuBar'>
        <Button onClick={(e) => setDisplayResponsiveMenu(true)}><MenuIcon /></Button>
      </Grid>

      <Grid item md={2} xs={6} className='headerMenu'>
        <ul style={{ display: 'flex', justifyContent: 'flex-end', gap: '18px', alignItems: 'center', marginTop: '45px' }}>
          <li className='menuBox'><img alt='icon-menu-1' src={icon1} /></li>
          <li className='menuBox'><img alt='icon-menu-1' src={icon2} /></li>
          <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><img alt='user-img' style={{width: '40px', border: '1px solid #fff', borderRadius: '7px' }} src={'https://s3-us-west-2.amazonaws.com/s.cdpn.io/156905/profile/profile-512.jpg?1530296477'} /><span className='responsive'>John Doe</span></li>
        </ul>
      </Grid>

      <Grid item xs={12} className='non-responsive'>
        <TextField variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { padding: '6px 17px', color: '#32363C' },
          }}
          className='searchBar' fullWidth placeholder="Search for online course" id="fullWidth" />
      </Grid>


      <Fade inProp={displayResponsiveMenu}>
        <header>
          <nav>
            <Grid container>
              <Grid item xs={10} className='logoContainer'>
                <Link onClick={() => setDisplayResponsiveMenu(false)} to="/"><img alt='logo' src={logo} /></Link>
              </Grid>

              <Grid item xs={2} className='responsiveClearIcon'>
                <Button onClick={() => setDisplayResponsiveMenu(false)}><ClearIcon /></Button>
              </Grid>
            </Grid>

          <ul>
            <li className={location.pathname === '/creations'? 'activeSidebarMenu' : ''}>
              <Link onClick={() => setDisplayResponsiveMenu(false)} to='/creations'>
                <img alt="menu-icon" src={location.pathname === '/creations' ? MenuIcon2Active : MenuIcon2} /> <span>Creations</span> 
              </Link>
            </li>
            <li className={location.pathname === '/invitation'? 'activeSidebarMenu' : ''} >
              <Link onClick={() => setDisplayResponsiveMenu(false)}  to='/invitation'>
                <img alt="menu-icon" src={location.pathname === '/invitation' ? MenuIcon3Active : MenuIcon3} /><span>Invitation</span>
              </Link>
            </li>
            <li className={location.pathname === '/litigation'? 'activeSidebarMenu' : ''} >
              <Link onClick={() => setDisplayResponsiveMenu(false)}  to='/litigation'>
                <img alt="menu-icon" src={location.pathname === '/litigation' ? MenuIcon4Active : MenuIcon4} /> <span>Litigation</span>
              </Link>
            </li>
            <li className={location.pathname === '/wallet'? 'activeSidebarMenu' : ''} >
              <Link onClick={() => setDisplayResponsiveMenu(false)}  to='/wallet'>
                <img alt="menu-icon" src={location.pathname === '/wallet' ? MenuIcon5Active : MenuIcon5}  />  <span>Wallet</span> 
              </Link>
            </li>
            <li className={location.pathname === '/credit'? 'activeSidebarMenu' : ''} >
              <Link onClick={() => setDisplayResponsiveMenu(false)}  to='/credit'>
                <img alt="menu-icon" src={location.pathname === '/credit' ? MenuIcon6Active : MenuIcon6}  />  <span>Credit</span> 
              </Link>
            </li>
          </ul>
          </nav>
        </header>
      </Fade>
    </Grid>
  );
}

export default HomeHeader;