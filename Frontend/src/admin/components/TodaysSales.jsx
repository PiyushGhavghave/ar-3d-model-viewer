import './TodaysSales.css';
import MetricsCard from './MetricsCard.jsx';

import chartIcon from '../assets/icons/Sales Icon.svg';
import fileIcon from '../assets/icons/Order Icon.svg';
import tagIcon from '../assets/icons/Disc Icon.svg';
import usersIcon from '../assets/icons/New Costumers Icon.svg';
import Export from '../assets/icons/Export Icon.svg'

const TodaysSales = () => {
  const metricsData = [
  {
    value: "$1k",
    description: "Total Sales",
    change: "+8% from yesterday",
    bgColor: "#FFE2E6",
    iconBg: "#FA5A7D",
    icon: chartIcon
  },
  {
    value: "300",
    description: "Total Order",
    change: "+5% from yesterday",
    bgColor: "#FFF4DE",
    iconBg: "#FF947A",
    icon: fileIcon
  },
  {
    value: "5",
    description: "Product Sold",
    change: "+1.2% from yesterday",
    bgColor: "#DCFCE7",
    iconBg: "#3CD856",
    icon: tagIcon
  },
  {
    value: "8",
    description: "New Customers",
    change: "+0.5% from yesterday",
    bgColor: "#F3E8FF",
    iconBg: "#BF83FF",
    icon: usersIcon
  }
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
