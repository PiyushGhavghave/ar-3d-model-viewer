import React from 'react';
import './App.css';
import Sidebar from './components/Sidebar.jsx';
import Header from './components/Header.jsx';
import Dashboard from './components/Dashboard.jsx';
import ManageUsers from './components/ManageUsers.jsx';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProfilePage from '../pages/Profile.jsx'

function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <Header />
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/users" element={<ManageUsers />} />
          <Route path="/profile" element={<ProfilePage inAdminPanel={true} />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
