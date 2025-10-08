import './Chart.css';

const Chart = ({ title, type, subtitle1, subtitle2, value1, value2, data, colors }) => {
  const renderBarChart = () => {
    return (
      <div className="bar-chart">
        {data.map((value, index) => (
          <div key={index} className="bar-container">
            <div 
              className="bar" 
              style={{ 
                height: `${(value / 12) * 100}%`,
                backgroundColor: index % 2 === 0 ? colors[0] : colors[1]
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderLineChart = () => {
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - (value / 12) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="line-chart">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke={colors[0]}
            strokeWidth="0.5"
            points={points}
          />
          <polyline
            fill="none"
            stroke={colors[1]}
            strokeWidth="0.5"
            points={data.map((value, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = 100 - ((value + 2) / 12) * 100;
              return `${x},${y}`;
            }).join(' ')}
          />
        </svg>
      </div>
    );
  };

  const renderBarComparison = () => {
    return (
      <div className="bar-comparison">
        {data.map((value, index) => (
          <div key={index} className="comparison-bar">
            <div 
              className="bar" 
              style={{ 
                height: `${(value / 12) * 100}%`,
                backgroundColor: colors[index % colors.length]
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  const renderServiceLevel = () => {
    return (
      <div className="service-level">
        {data.map((value, index) => (
          <div key={index} className="service-bar">
            <div 
              className="volume-bar" 
              style={{ 
                height: `${(value / 12) * 100}%`,
                backgroundColor: colors[0]
              }}
            />
            <div 
              className="service-bar-inner" 
              style={{ 
                height: `${((value - 2) / 12) * 100}%`,
                backgroundColor: colors[1]
              }}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`chart ${type}`}>
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        {(subtitle1 || subtitle2) && (
          <div className="chart-legend">
            {subtitle1 && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: colors[0] }}></div>
                <span>{subtitle1}</span>
                {value1 && <span className="legend-value">{value1}</span>}
              </div>
            )}
            {subtitle2 && (
              <div className="legend-item">
                <div className="legend-color" style={{ backgroundColor: colors[1] }}></div>
                <span>{subtitle2}</span>
                {value2 && <span className="legend-value">{value2}</span>}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="chart-content">
        {type === 'bar' && renderBarChart()}
        {type === 'line' && renderLineChart()}
        {type === 'bar-comparison' && renderBarComparison()}
        {type === 'service-level' && renderServiceLevel()}
      </div>
    </div>
  );
};

export default Chart;
