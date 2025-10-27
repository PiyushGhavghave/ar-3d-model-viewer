import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthProvider';
import * as api from '../../api';
import { formatDistanceToNow } from 'date-fns';

import './Header.css';
import Magnifier from '../assets/icons/magnifier.svg'
import USAFlag from '../assets/icons/United.svg'
import Notifications from '../assets/icons/notification-line.svg'

const Header = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    // 1. Fetch initial data
    const fetchInitialNotifications = async () => {
      try {
        const data = await api.getNotifications();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };
    fetchInitialNotifications();

    // 2. Set up Server-Sent Events (SSE) connection
    const eventSource = new EventSource('/api/v1/notifications/stream', { withCredentials: true });

    eventSource.onmessage = (event) => {
      const newNotification = JSON.parse(event.data);
      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    eventSource.onerror = (error) => {
      console.error('EventSource failed:', error);
      eventSource.close();
    };

    // Cleanup
    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async () => {
    setIsDropdownOpen(prev => !prev);
    if (unreadCount > 0) {
      try {
        await api.markAllNotificationsAsRead();
        setUnreadCount(0);
        // Visually mark all as read
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      } catch (error) {
        console.error("Failed to mark notifications as read:", error);
      }
    }
  };

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

          
          <div className="notifications" ref={dropdownRef}>
            <button onClick={handleNotificationClick} className="notification-button">
              <img src={Notifications} alt="Notifications" className="notification-icon" />
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>
            {isDropdownOpen && (
              <div className="notification-dropdown">
                <div className="dropdown-header">
                  <h3>Notifications</h3>
                </div>
                <div className="dropdown-body">
                  {notifications.length > 0 ? (
                    notifications.map(notif => (
                      <Link to={notif.link} key={notif._id} className="notification-item" onClick={() => setIsDropdownOpen(false)}>
                        <p className={`notification-message ${!notif.isRead && unreadCount === 0 ? 'font-semibold' : ''}`}>{notif.message}</p>
                        <span className="notification-time">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="no-notifications">No new notifications</p>
                  )}
                </div>
              </div>
            )}
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
