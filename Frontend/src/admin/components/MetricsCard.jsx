import './MetricsCard.css';

const MetricsCard = ({ value, description, change, bgColor, iconBg, icon }) => {
  return (
    <div className="metrics-card" style={{ backgroundColor: bgColor }}>
      <div className="icon-circle" style={{ backgroundColor: iconBg }}>
        <img src={icon} alt={description} className="metric-icon" />
      </div>
      <h3 className="value">{value}</h3>
      <p className="description">{description}</p>
      <p className="change">{change}</p>
    </div>
  );
};

export default MetricsCard;
