import { Logout } from '@mui/icons-material';
import ClearIcon from '@mui/icons-material/Clear';
import MenuIcon from '@mui/icons-material/Menu';
import { Box, Button, Grid } from '@mui/material';
import logo from 'assets/images/logo-beta.png';
import { FaUser } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import LoginModal from '../../LoginModal';
import '../responsive-menu-transition.css';
import SideBar from '../Sidebar/Sidebar';
import './Header.css';
import useHeader from './useHeader';

function HomeHeader({ displayNav = false }) {
  const {
    displayResponsiveMenu,
    setDisplayResponsiveMenu,
    handleLogin,
    handleLogout,
    location,
    showLoginForm,
    setShowLoginForm,
    loggedInUser,
  } = useHeader();

  return (
    <Grid container className="header" alignItems="center">
      {/* {!location && <LoginModal />} */}
      {showLoginForm && (
        <LoginModal
          onClose={() => setShowLoginForm(false)}
          onLoggedIn={handleLogin}
        />
      )}
      <Grid
        item
        md={3}
        justifyContent="flex-start"
        alignItems="center"
        display={{ xs: 'none', sm: 'none', md: 'flex' }}
      >
        <Link to="/">
          <img alt="POCRE logo" src={logo} className="site-logo" />
        </Link>
      </Grid>

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
              {
                loggedInUser && (
                <li className={location.pathname === '/litigations' ? 'activeSidebarMenu' : ''}>
                  <Link to="/litigations">Litigations</Link>
                </li>
                )
                }
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
        gap="16px"
      >
        {loggedInUser && (
          <div className="loggedin-user">
            <Link to={`/wallet/${loggedInUser?.user_id}`}>
              <img
                alt=""
                src={loggedInUser.image_url}
                className="profile-pic profile-pic-small"
              />
            </Link>
            <Link to={`/wallet/${loggedInUser?.user_id}`}>
              <h4>{loggedInUser.user_name}</h4>
            </Link>
          </div>
        )}
        <Button
          variant="contained"
          onClick={() => (loggedInUser ? handleLogout() : setShowLoginForm(true))}
          endIcon={loggedInUser ? <Logout fontSize=".5rem" /> : <FaUser />}
          style={{
            flexShrink: '0',
            width: loggedInUser ? '80px' : '100px',
            fontSize: loggedInUser ? '.7rem' : '1rem',
            background: loggedInUser ? '#F19141' : '#F9A381',
            color: 'white',
            marginLeft: 'auto',
          }}
        >
          {loggedInUser ? 'Logout' : 'Login'}
        </Button>
      </Grid>

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
                  <img alt="POCRE logo" src={logo} className="site-logo" />
                </Link>
              </Grid>

              <Grid item xs={4} className="responsiveClearIcon">
                <Button onClick={() => setDisplayResponsiveMenu(false)}>
                  <ClearIcon fontSize="large" />
                </Button>
              </Grid>
            </Grid>

            <SideBar />
          </nav>
        </Box>
      )}
    </Grid>
  );
}

export default HomeHeader;
