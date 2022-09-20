import '../responsive-menu-transition.css';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import {
  // Button,
  Grid,
  // Fade,
  Button,
  Box,
  // TextField
} from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
// import { CSSTransition } from 'react-transition-group';
// import MenuIcon4 from "../../../assets/bank-icon.png";
// import MenuIcon4Active from "../../../assets/bank-icon-2.png";
// import MenuIcon2 from "../../../assets/book-icon.png";
// import MenuIcon2Active from "../../../assets/book-icon-2.png";
// import MenuIcon6 from "../../../assets/credit.png";
// import MenuIcon6Active from "../../../assets/credit-icon-2.png";
// import MenuIcon3 from "../../../assets/envelope-icon.png";
// import MenuIcon3Active from "../../../assets/envelope-icon-2.png";
// import icon1 from "../../../assets/icon-1.png";
// import icon2 from "../../../assets/icon-2.png";
import logo from '../../../assets/logo-1.png';
// import MenuIcon5 from "../../../assets/wallet-icon.png";
// import MenuIcon5Active from "../../../assets/wallet-icon-2.png";
import './Header.css';
import SideBar from '../Sidebar/Sidebar';

// const duration = 200000;

function HomeHeader({ displayNav = false }) {
  const location = useLocation();

  const [displayResponsiveMenu, setDisplayResponsiveMenu] = React.useState(false);

  return (
    <Grid container className="header" alignItems="center">
      <Grid
        item
        md={3}
        justifyContent="flex-start"
        alignItems="center"
        display={{ xs: 'none', sm: 'none', md: 'flex' }}
      >
        <Link to="/"><img alt="logo" src={logo} className="site-logo" /></Link>
      </Grid>

      {/* <Grid item md={4} className='responsive'>
        <TextField variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { padding: '6px 17px', color: '#32363C' },
          }}
          className='searchBar' fullWidth placeholder="Search for online course" id="fullWidth" />
      </Grid> */}

      <Grid
        item
        md={6}
        alignItems="center"
        justifyContent="center"
        flexWrap="wrap"
        display={{ xs: 'none', sm: 'none', md: 'flex' }}
      >
        {displayNav && (
        <nav className="site-nav">
          <ul>
            <li className={location.pathname === '/creations' ? 'activeSidebarMenu' : ''}><Link to="/creations">Creations</Link></li>
            <li className={location.pathname === '/invitation' ? 'activeSidebarMenu' : ''}><Link to="/invitation">Invitation</Link></li>
            <li className={location.pathname === '/litigation' ? 'activeSidebarMenu' : ''}><Link to="/litigation">Litigation</Link></li>
            <li className={location.pathname === '/wallet' ? 'activeSidebarMenu' : ''}><Link to="/wallet">Wallet</Link></li>
            <li className={location.pathname === '/credit' ? 'activeSidebarMenu' : ''}><Link to="/credit">Credit</Link></li>
          </ul>
        </nav>
        )}
      </Grid>

      <Grid
        item
        xs={3}
        marginRight="auto"
        justifyContent="flex-start"
        alignItems="flex-start"
        display={{ xs: 'flex', sm: 'flex', md: 'none' }}
      >
        <Button
          style={{
            minWidth: 'initial', padding: '24', backgroundColor: '#ffffff', borderRadius: '4px',
          }}
          onClick={() => setDisplayResponsiveMenu(!displayResponsiveMenu)}
        >
          <MenuIcon color="black" />
        </Button>
      </Grid>

      <Grid
        item
        md={3}
        marginLeft="auto"
        display="flex"
        justifyContent="flex-end"
        alignItems="center"
      >
        <ul style={{
          display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
        }}
        >
          {/* <li className='menuBox'><img alt='icon-menu-1' src={icon1} /></li>
          <li className='menuBox'><img alt='icon-menu-1' src={icon2} /></li> */}
          <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <img alt="user-img" style={{ width: '40px', border: '1px solid #fff', borderRadius: '7px' }} src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/156905/profile/profile-512.jpg?1530296477" />
            <span className="responsive">John Doe</span>
          </li>
        </ul>
      </Grid>

      {/* <Grid item xs={12} className='non-responsive'>
        <TextField variant="standard"
          InputProps={{
            disableUnderline: true,
            style: { padding: '6px 17px', color: '#32363C' },
          }}
          className='searchBar' fullWidth placeholder="Search for online course" id="fullWidth" />
      </Grid> */}

      {/* <Fade
        inProp={displayResponsiveMenu}
        onExit={() => setDisplayResponsiveMenu(false)}
      > */}
      {displayResponsiveMenu && (
      <Box component="header" className="site-popup-menu" padding="2" display={{ md: 'none' }}>
        <nav>
          <Grid container className="site-popup-header" alignItems="center" justifyContent="space-between">
            <Grid item xs={8} paddingTop="12" paddingLeft="12" alignItems="center">
              <Link onClick={() => setDisplayResponsiveMenu(false)} to="/"><img alt="logo" src={logo} className="site-logo" /></Link>
            </Grid>

            <Grid item xs={4} className="responsiveClearIcon">
              <Button onClick={() => setDisplayResponsiveMenu(false)}><ClearIcon fontSize="large" /></Button>
            </Grid>
          </Grid>

          <SideBar />
          {/* <ul className="sidebar">
              <li className={location.pathname === '/creations' ? 'activeSidebarMenu' : ''}>
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/creations'>
                </Link>
              </li>
              <li className={location.pathname === '/invitation' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/invitation'>
                </Link>
              </li>
              <li className={location.pathname === '/litigation' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/litigation'>
                </Link>
              </li>
              <li className={location.pathname === '/wallet' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/wallet'>
                </Link>
              </li>
              <li className={location.pathname === '/credit' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/credit'>
                </Link>
              </li>
            </ul> */}
        </nav>
      </Box>
      )}
      {/* </Fade> */}
    </Grid>
  );
}

export default HomeHeader;
