import './Sidebar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

import DummyLogo from '../assets/icons/dummy logo.svg';
import DashboardIcon from '../assets/icons/sidebar-icons/Graph 1.svg';
import UsersIcon from '../assets/icons/sidebar-icons/Group.svg';
import SignOutIcon from '../assets/icons/sidebar-icons/Group 923.svg';


const Sidebar = () => {
  const { doLogout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    doLogout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: DashboardIcon, path: '/admin/dashboard' },
    { id: 'users', name: 'Users', icon: UsersIcon, path: '/admin/users' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
          <div className="logo">
            <img src={DummyLogo} alt="Logo" className="logo-img" />
            <span className="logo-text">AR Admin</span>
          </div>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <img src={item.icon} alt={item.name} className="nav-icon" />
            <span className="nav-text">{item.name}</span>
          </NavLink>
        ))}

        <div className="nav-item" onClick={handleSignOut} style={{ cursor: 'pointer' }}>
            <img src={SignOutIcon} alt="Sign Out" className="nav-icon" />
            <span className="nav-text">Sign Out</span>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;