import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Grid } from '@mui/material';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../responsive-menu-transition.css';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import logo from 'assets/images/logo-beta.png';
import LoginButton from 'components/styled/btns/LoginButton';
import SideBar from '../Sidebar/Sidebar';
import './Header.css';
import useHeader from './useHeader';

// const duration = 200000;

// const Fade = (props) => {
//   return (
//     <CSSTransition
// classNames="alert" in={props.inProp} timeout={duration} unmountOnExit onExit={props.onExit}>
//       {props.children}
//     </CSSTransition>
//   );
// };

function HomeHeader({ displayNav = false }) {
  const location = useLocation();
  const {
    fetchUserStatus, users, activeUser, onUserSelect, login,
  } = useHeader();

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
        <Link to="/">
          <img alt="logo" src={logo} className="site-logo" />
        </Link>
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
              <li className={location.pathname === '/creations' ? 'activeSidebarMenu' : ''}>
                <Link to="/creations">Creations</Link>
              </li>
              <li className={location.pathname === '/recognitions' ? 'activeSidebarMenu' : ''}>
                <Link to="/recognitions">Recognitions</Link>
              </li>
              <li className={location.pathname === '/litigations' ? 'activeSidebarMenu' : ''}>
                <Link to="/litigations">Litigations</Link>
              </li>
              <li className={location.pathname === '/wallet' ? 'activeSidebarMenu' : ''}>
                <Link to="/wallet">Wallet</Link>
              </li>
              <li className={location.pathname === '/credits' ? 'activeSidebarMenu' : ''}>
                <Link to="/credits">Credits</Link>
              </li>
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
            minWidth: 'initial',
            padding: '24',
            backgroundColor: '#ffffff',
            borderRadius: '4px',
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
        {login && (
          <ul
            style={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            {/* <li className='menuBox'><img alt='icon-menu-1' src={icon1} /></li>
          <li className='menuBox'><img alt='icon-menu-1' src={icon2} /></li> */}
            <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {activeUser && (
                <img
                  alt="user-img"
                  style={{
                    width: '40px',
                    border: '1px solid #fff',
                    borderRadius: '7px',
                  }}
                  src={activeUser.avatar}
                />
              )}
              {fetchUserStatus.error && <span className="responsive">{fetchUserStatus.error}</span>}
              {fetchUserStatus.success && activeUser && (
                <FormControl fullWidth variant="standard" style={{ minWidth: '220px' }}>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={activeUser.user_id}
                    style={{ border: 'none' }}
                    // {... (activeUser.user_id && { value: activeUser?.user_id })}
                    onChange={onUserSelect}
                    SelectDisplayProps={{
                      style: { border: 'none' },
                    }}
                  >
                    {users.map((x, index) => (
                      <MenuItem key={index} value={x.user_id}>
                        {x.user_name}
                        {' '}
                        (Test User)
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </li>
          </ul>
        )}
        <LoginButton />
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
            <Grid
              container
              className="site-popup-header"
              alignItems="center"
              justifyContent="space-between"
            >
              <Grid item xs={8} paddingTop="12" paddingLeft="12" alignItems="center">
                <Link onClick={() => setDisplayResponsiveMenu(false)} to="/">
                  <img alt="logo" src={logo} className="site-logo" />
                </Link>
              </Grid>

              <Grid item xs={4} className="responsiveClearIcon">
                <Button onClick={() => setDisplayResponsiveMenu(false)}>
                  <ClearIcon fontSize="large" />
                </Button>
              </Grid>
            </Grid>

            <SideBar />
            {/* <ul className="sidebar">
              <li className={location.pathname === '/creations' ? 'activeSidebarMenu' : ''}>
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/creations'>
                  <img
                  alt="menu-icon"
                  src={location.pathname === '/creations' ? MenuIcon2Active : MenuIcon2} />
                  <span>Creations</span>
                </Link>
              </li>
              <li className={location.pathname === '/recognitions' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/recognitions'>
                  <img
                  alt="menu-icon"
                   src={location.pathname === '/recognitions' ? MenuIcon3Active : MenuIcon3} />
                   <span>Recognition</span>
                </Link>
              </li>
              <li className={location.pathname === '/litigation' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/litigation'>
                  <img
                  alt="menu-icon"
                   src={location.pathname === '/litigation' ? MenuIcon4Active : MenuIcon4} />
                   <span>Litigation</span>
                </Link>
              </li>
              <li className={location.pathname === '/wallet' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/wallet'>
                  <img
                  alt="menu-icon"
                   src={location.pathname === '/wallet' ? MenuIcon5Active : MenuIcon5} />
                   <span>Wallet</span>
                </Link>
              </li>
              <li className={location.pathname === '/credit' ? 'activeSidebarMenu' : ''} >
                <Link onClick={() => setDisplayResponsiveMenu(false)} to='/credit'>
                  <img
                  alt="menu-icon"
                   src={location.pathname === '/credit' ? MenuIcon6Active : MenuIcon6} />
                   <span>Credits</span>
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
