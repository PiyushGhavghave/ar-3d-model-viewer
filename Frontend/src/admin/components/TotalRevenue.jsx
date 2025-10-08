import ReactECharts from "echarts-for-react";
import "./TotalRevenue.css";
import { useMemo } from "react";

const TotalRevenue = () => {
  const data = {
    "Online Sales": [14, 17, 6, 15.8, 12, 16.7, 21],
    "Offline Sales": [12.5, 12, 22.5, 6.7, 11.5, 13.5, 11],
  };

  const option = useMemo(() => {
    return {
      color: ["#0095FF", "#00E096"],

      tooltip: {
        confine: true,
      },

      legend: {
        data: ["Online Sales", "Offline Sales"],
        left: "center",
        bottom: 0,
        icon: "circle",
        textStyle: {
          fontSize: 13,
          color: "#374151",
        },
        itemGap: 16,
        itemHeight: 11,
      },

      xAxis: {
        data: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          fontSize: 12,
          color: "#6B7280",
          margin: 18,
        },
      },

      yAxis: {
        type: "value",
        axisLabel: {
          fontSize: 12,
          color: "#6B7280",
          formatter: "{value}k",
          margin: 18,
        },
        splitLine: {
          lineStyle: { color: "#E5E7EB" },
        },
      },

      grid: {
        top: "4%",
        left: 0,
        right: 6,
        bottom: 45,
        containLabel: true,
      },

      series: [
        {
          name: "Online Sales",
          type: "bar",
          data: data["Online Sales"],
          itemStyle: { borderRadius: 2 },
          barCategoryGap: "65%",
        },
        {
          name: "Offline Sales",
          type: "bar",
          data: data["Offline Sales"],
          itemStyle: { borderRadius: 2 },
          barCategoryGap: "65%",
        },
      ],
    };
  }, []);

  return (
    <div className="total-revenue-card">
      <h2 className="total-revenue-title">Total Revenue</h2>
      <div className="total-revenue-chart">
        <ReactECharts option={option} style={{ height: 320, width: "100%" }} />
      </div>
    </div>
  );
};

export default TotalRevenue;
