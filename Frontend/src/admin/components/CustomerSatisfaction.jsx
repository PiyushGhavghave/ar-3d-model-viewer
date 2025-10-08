import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import "./CustomerSatisfaction.css";
import BlueDot from '../assets/icons/Group 18.svg'
import GreenDot from '../assets/icons/Group 18 Copy.svg'

const CustomerSatisfaction = () => {
  const data = {
    "Last Month": [3000, 3500, 2000, 2200, 2800, 2900, 3100],
    "This Month": [4000, 3700, 4200, 3900, 4300, 3600, 4500],
  };

  // Declarative selection state — must match series names exactly
  const [selected, setSelected] = useState({
    "Last Month": true,
    "This Month": true,
  });

  const option = useMemo(() => {
    return {
      color: ["#3B82F6", "#10B981"],

      tooltip: {
        trigger: "item",
        confine: true,
      },

      // Keep legend component (even if hidden) and drive selection here
      legend: {
        show: false,
        data: ["Last Month", "This Month"],
        selected, // <- sync with React state
      },

      grid: {
        top: 10,
        left: -20,
        right: 6,
        bottom: 0,
        containLabel: true,
      },

      xAxis: {
        type: "category",
        boundaryGap: false,
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        show: false,
      },

      yAxis: { type: "value", show: false },

      series: [
        {
          name: "Last Month",
          type: "line",
          smooth: true,
          data: data["Last Month"],
          symbol: "circle",
          symbolSize: 8,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(59, 130, 246, 0.32)" },
                { offset: 0.5, color: "rgba(59, 130, 246, 0)" },
              ],
            },
          },
          emphasis: { focus: "series" },
        },
        {
          name: "This Month",
          type: "line",
          smooth: true,
          data: data["This Month"],
          symbol: "circle",
          symbolSize: 8,
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(16, 185, 129, 0.32)" },
                { offset: 0.5, color: "rgba(16, 185, 129, 0)" },
              ],
            },
          },
          emphasis: { focus: "series" },
        },
      ],
    };
  }, [selected, data]);

  const toggle = (name) =>
    setSelected((s) => ({ ...s, [name]: !s[name] }));

  return (
    <div className="customer-satisfaction-card">
      <h2 className="customer-satisfaction-title">Customer Satisfaction</h2>

      <div className="customer-satisfaction-chart">
        <ReactECharts option={option} style={{ height: 182, width: "100%" }} />
      </div>

      <div className="customer-satisfaction-legend">
        <div
          className={`legend-item ${!selected["Last Month"] ? "inactive" : ""}`}
          onClick={() => toggle("Last Month")}
          role="button"
          aria-pressed={selected["Last Month"]}
        >
          <img src={BlueDot} alt="dot blue" />
          <span className="label">Last Month</span>
          <span className="value">$3,004</span>
        </div>

        <div className="divider"></div>

        <div
          className={`legend-item ${!selected["This Month"] ? "inactive" : ""}`}
          onClick={() => toggle("This Month")}
          role="button"
          aria-pressed={selected["This Month"]}
        >
          <img src={GreenDot} alt="dot green" />
          <span className="label">This Month</span>
          <span className="value">$4,504</span>
        </div>
      </div>
    </div>
  );
};

export default CustomerSatisfaction;
