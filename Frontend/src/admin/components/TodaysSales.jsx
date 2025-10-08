import React, { useState, useEffect } from 'react';
import * as api from '../../api';
import './TodaysSales.css';
import MetricsCard from './MetricsCard.jsx';

import chartIcon from '../assets/icons/Sales Icon.svg';
import tagIcon from '../assets/icons/Disc Icon.svg';
import usersIcon from '../assets/icons/New Costumers Icon.svg';
import modelsIcon from '../assets/icons/sidebar-icons/Cart.svg'; // Using Cart icon for Models
import Export from '../assets/icons/Export Icon.svg'

const TodaysSales = () => {
  const [stats, setStats] = useState({ userCount: 0, modelCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
        try {
            const data = await api.getAdminStats();
            setStats(data);
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        } finally {
            setLoading(false);
        }
    };
    fetchStats();
  }, []);

  const metricsData = [
    {
      value: loading ? '...' : stats.userCount,
      description: "Total Users",
      change: "All registered users",
      bgColor: "#F3E8FF",
      iconBg: "#BF83FF",
      icon: usersIcon
    },
    {
      value: loading ? '...' : stats.modelCount,
      description: "Total Models",
      change: "All uploaded models",
      bgColor: "#DCFCE7",
      iconBg: "#3CD856",
      icon: modelsIcon
    },
  ];

  return (
    <div className="todays-sales">
      <div className="sales-header">
        <div>
          <h2>Today's Sales</h2>
          <p>Sales Summary</p>
        </div>
        <button className="export-btn">
          <img src={Export} alt="Export" className="metric-icon" /> 
          Export
        </button>
      </div>
      
      <div className="todays-sales-grid">
        {metricsData.map((metric, index) => (
          <MetricsCard key={index} {...metric} />
        ))}
      </div>
    </div>
  );
};

export default TodaysSales;
