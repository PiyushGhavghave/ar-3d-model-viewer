import { useRef, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import "./VisitorInsights.css";

const visitorData = {
  "Loyal Customers": [320, 310, 280, 220, 200, 280, 330, 310, 280, 260, 230, 200],
  "New Customers": [210, 230, 180, 100, 160, 290, 350, 320, 290, 260, 200, 150],
  "Unique Customers": [270, 320, 290, 240, 210, 250, 320, 300, 270, 250, 220, 260],
};

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function VisitorInsights() {
  const chartRef = useRef(null);

  const [legend, setLegend] = useState({
    "Loyal Customers": true,
    "New Customers": true,
    "Unique Customers": true,
  });

  const handleLegendToggle = (name) => {
    setLegend((prev) => ({ ...prev, [name]: !prev[name] }));
    if (chartRef.current) {
      const instance = chartRef.current.getEchartsInstance();
      instance.dispatchAction({
        type: "legendToggleSelect",
        name,
      });
    }
  };

  const option = useMemo(() => {
    return {
      color: ["#8B5CF6", "#F43F5E", "#22C55E"],
      tooltip: {
        trigger: "axis",
        axisPointer: {
          lineStyle: { color: "#F43F5E" },
        },
      },
      legend: { show: false },
      grid: { top: 20, left: 10, right: 10, bottom: 20, containLabel: true },
      xAxis: {
        type: "category",
        data: months,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          fontSize: 12,
          color: "#6b7280", // gray-500
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 12,
          color: "#9ca3af", // gray-400
        },
        splitLine: {
          lineStyle: { color: "#e5e7eb" }, // gray-200
        },
      },
      series: [
        {
          name: "Loyal Customers",
          type: "line",
          data: visitorData["Loyal Customers"],
          smooth: true,
          symbol: "circle",
          showSymbol: false,
          lineStyle: { width: 4 },
        },
        {
          name: "New Customers",
          type: "line",
          data: visitorData["New Customers"],
          smooth: true,
          symbol: "circle",
          showSymbol: false,
          lineStyle: { width: 4 },
        },
        {
          name: "Unique Customers",
          type: "line",
          data: visitorData["Unique Customers"],
          smooth: true,
          symbol: "circle",
          showSymbol: false,
          lineStyle: { width: 4 },
        },
      ],
    };
  }, []);

  return (
    <div className="visitor-insights">
      <h3 className="insights-title">Visitor Insights</h3>

      <ReactECharts ref={chartRef} option={option} style={{ height: 220, width: "100%" }} />

      <div className="custom-legend">
        {Object.keys(legend).map((name, idx) => (
          <button
            key={name}
            className={`legend-btn ${legend[name] ? "active" : ""}`}
            onClick={() => handleLegendToggle(name)}
          >
            <span
              className="legend-dot"
              style={{ backgroundColor: option.color[idx] }}
            ></span>
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}
