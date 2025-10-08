import './Dashboard.css';
import TodaysSales from './TodaysSales.jsx';
import TopProducts from './TopProducts.jsx';
import VisitorInsights from './VisitorInsights.jsx';
import TotalRevenue from './TotalRevenue.jsx';
import CustomerSatisfaction from './CustomerSatisfaction.jsx';
import TargetVsReality from './TargetVsReality.jsx';
import VolumeServiceLevel from './VolumeServiceLevel.jsx';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="dashboard-content">
        <div className="top-section">
          <div className="todays-sales-container">
            <TodaysSales />
          </div>
          <div className="visitor-insights-container">
            <VisitorInsights />
          </div>
        </div>

        <div className="charts-section">
          <div className="chart-grid-three">
            <TotalRevenue />
            <CustomerSatisfaction />
            <TargetVsReality />
          </div>
        </div>

        <div className="bottom-section">
          <TopProducts />
          <VolumeServiceLevel />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
