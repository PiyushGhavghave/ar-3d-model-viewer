import './Header.css';
import Magnifier from '../assets/icons/magnifier.svg'
import USAFlag from '../assets/icons/United.svg'
import Notifications from '../assets/icons/notification-line.svg'
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';

const Header = () => {
  const { user } = useAuth();

  return (
    <div className="header">
      <div className="header-content">
        <h1 className="page-title">Dashboard</h1>
        <div className="header-actions">
          <div className="search-container">
            <div className="search-input">
              <img src={Magnifier} alt="Search" className="metric-icon" />
              <input type="text" placeholder="Search here..." />
            </div>
          </div>
          <div className="language-selector">
            <img src={USAFlag} alt="USA Flag" className="metric-icon" />
            <span className="language">Eng (US)</span>
            <span className="dropdown-arrow">▼</span>
          </div>
          <div className="notifications">
            <img src={Notifications} alt="Notifications" className="notification-icon" />
          </div>
          <Link to="/admin/profile" className="user-profile">
            <img 
              src={user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
              alt="User" 
              className="user-avatar" 
            />
            <div className="user-info">
              <span className="user-name">{user?.username || 'Admin'}</span>
              <span className="user-role">{user?.role || 'Admin'}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Header;
