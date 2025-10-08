import './Header.css';
import Magnifier from '../assets/icons/magnifier.svg'
import USAFlag from '../assets/icons/United.svg'
import Notifications from '../assets/icons/notification-line.svg'

const Header = () => {
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
          <div className="user-profile">
            <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face" alt="User" className="user-avatar" />
            <div className="user-info">
              <span className="user-name">Mufiq</span>
              <span className="user-role">Admin</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
