import { Link, useLocation } from 'react-router-dom';
import MenuIcon4 from 'assets/images/bank-icon.png';
import MenuIcon2 from 'assets/images/book-icon.png';
import MenuIcon6 from 'assets/images/credit.png';
import MenuIcon3 from 'assets/images/envelope-icon.png';
import MenuIcon5 from 'assets/images/wallet-icon.png';
import MenuIcon4Active from 'assets/images/bank-icon-2.png';
import MenuIcon2Active from 'assets/images/book-icon-2.png';
import MenuIcon6Active from 'assets/images/credit-icon-2.png';
import MenuIcon3Active from 'assets/images/envelope-icon-2.png';
import MenuIcon5Active from 'assets/images/wallet-icon-2.png';
import HomeIcon from 'assets/images/homeicon.png';

import './Sidebar.css';
import useUserInfo from 'hooks/user/userInfo';

function SideBar() {
  const location = useLocation();
  const login = useUserInfo((s) => s.login);
  return (
    <div className="sidebar">
      <ul>
        <li className={location.pathname.includes('/home') ? 'activeSidebarMenu' : ''}>
          <Link to="/home">
            <img
              alt="menu-icon"
              src={HomeIcon}
            />
            <span>Home</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/creations') ? 'activeSidebarMenu' : ''}>
          <Link to="/creations">
            <img
              alt="menu-icon"
              src={location.pathname.includes('/creations') ? MenuIcon2Active : MenuIcon2}
            />
            <span>Creations</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/recognitions') ? 'activeSidebarMenu' : ''}>
          <Link to="/recognitions">
            <img
              alt="menu-icon"
              src={location.pathname.includes('/recognitions') ? MenuIcon3Active : MenuIcon3}
            />
            <span>Recognitions</span>
          </Link>
        </li>
        {login && (
          <li className={location.pathname.includes('/litigations') ? 'activeSidebarMenu' : ''}>
            {/* {login ? (
            <Link to="/litigations">
              <img
                alt="menu-icon"
                src={
                  location.pathname.includes("/litigations")
                    ? MenuIcon4Active
                    : MenuIcon4
                }
              />
              <span>Litigation</span>
            </Link>
          ) : (
            <a className="inActive">
              <img
                alt="menu-icon"
                src={
                  location.pathname.includes("/litigations")
                    ? MenuIcon4Active
                    : MenuIcon4
                }
              />
              <span>Litigation</span>
            </a>
          )} */}

            <Link to="/litigations">
              <img
                alt="menu-icon"
                src={location.pathname.includes('/litigations') ? MenuIcon4Active : MenuIcon4}
              />
              <span>Litigations</span>
            </Link>
          </li>
        )}
        <li className={location.pathname.includes('/wallet') ? 'activeSidebarMenu' : ''}>
          <Link to="/wallet">
            <img
              alt="menu-icon"
              src={location.pathname.includes('/wallet') ? MenuIcon5Active : MenuIcon5}
            />
            <span>Wallet</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/credits') ? 'activeSidebarMenu' : ''}>
          <Link to="/credits">
            <img
              alt="menu-icon"
              src={location.pathname.includes('/credits') ? MenuIcon6Active : MenuIcon6}
            />
            <span>Credits</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default SideBar;
