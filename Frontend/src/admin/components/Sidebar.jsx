import './Sidebar.css';
import DummyLogo from '../assets/icons/dummy logo.svg';
import Dashboard from '../assets/icons/sidebar-icons/Graph 1.svg'
import Leaderboard from '../assets/icons/sidebar-icons/Group.svg';
import Order from '../assets/icons/sidebar-icons/Cart.svg';
import Products from '../assets/icons/sidebar-icons/Vector.svg';
import SalesReport from '../assets/icons/sidebar-icons/Chart_Line.svg';
import Messages from '../assets/icons/sidebar-icons/message-processing-outline.svg';
import Settings from '../assets/icons/sidebar-icons/setting-outline.svg';
import SignOut from '../assets/icons/sidebar-icons/Group 923.svg';

const Sidebar = () => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: Dashboard, active: true },
    { id: 'leaderboard', name: 'Leaderboard', icon: Leaderboard, active: false },
    { id: 'order', name: 'Order', icon: Order, active: false },
    { id: 'products', name: 'Products', icon: Products, active: false },
    { id: 'sales-report', name: 'Sales Report', icon: SalesReport, active: false },
    { id: 'messages', name: 'Messages', icon: Messages, active: false },
    { id: 'settings', name: 'Settings', icon: Settings, active: false },
    { id: 'sign-out', name: 'Sign Out', icon: SignOut, active: false }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
          <div className="logo">
            <img src={DummyLogo} alt="Logo" className="logo-img" />
            <span className="logo-text">Dabang</span>
          </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className={`nav-item ${item.active ? 'active' : ''}`}>
            <img src={item.icon} alt={item.name} className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
