import { Link, useLocation } from "react-router-dom";
import MenuIcon4 from "../../../assets/bank-icon.png";
import MenuIcon2 from "../../../assets/book-icon.png";
import MenuIcon6 from "../../../assets/credit.png";
import MenuIcon3 from "../../../assets/envelope-icon.png";
import MenuIcon5 from "../../../assets/wallet-icon.png";
import MenuIcon4Active from "../../../assets/bank-icon-2.png";
import MenuIcon2Active from "../../../assets/book-icon-2.png";
import MenuIcon6Active from "../../../assets/credit-icon-2.png";
import MenuIcon3Active from "../../../assets/envelope-icon-2.png";
import MenuIcon5Active from "../../../assets/wallet-icon-2.png";
import "./Sidebar.css"

function SideBar() {
  const location = useLocation();

  return (
    <div className="sidebar">
      <ul>
        {/* <li className={location.pathname.includes('/course')? 'activeSidebarMenu' : ''}><Link  to='/course'><img alt="menu-icon" src={MenuIcon1} /> Course </Link></li> */}
        <li className={location.pathname.includes('/creations') ? 'activeSidebarMenu' : ''}>
          <Link to='/creations'>
            <img alt="menu-icon" src={location.pathname.includes('/creations') ? MenuIcon2Active : MenuIcon2} /><span>Creations</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/invitation') ? 'activeSidebarMenu' : ''} >
          <Link to='/invitation'>
            <img alt="menu-icon" src={location.pathname.includes('/invitation') ? MenuIcon3Active : MenuIcon3} /><span>Invitation</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/litigation') ? 'activeSidebarMenu' : ''} >
          <Link to='/litigation'>
            <img alt="menu-icon" src={location.pathname.includes('/litigation') ? MenuIcon4Active : MenuIcon4} /><span>Litigation</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/wallet') ? 'activeSidebarMenu' : ''} >
          <Link to='/wallet'>
            <img alt="menu-icon" src={location.pathname.includes('/wallet') ? MenuIcon5Active : MenuIcon5} /><span>Wallet</span>
          </Link>
        </li>
        <li className={location.pathname.includes('/credit') ? 'activeSidebarMenu' : ''} >
          <Link to='/credit'>
            <img alt="menu-icon" src={location.pathname.includes('/credit') ? MenuIcon6Active : MenuIcon6} /><span>Credit</span>
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default SideBar;