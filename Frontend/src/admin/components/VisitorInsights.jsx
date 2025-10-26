import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import * as api from '../../api';
import "./VisitorInsights.css";

const getMonthName = (monthNumber) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[monthNumber - 1]; // monthNumber is 1-based
};

const formatDataForChart = (apiData) => {
    const labels = [];
    const counts = [];
    const today = new Date();
    
    const dataMap = new Map();
    apiData.forEach(item => {
        // key like "2025-10"
        const key = `${item.year}-${item.month}`;
        dataMap.set(key, item.count);
    });

    for (let i = 11; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const shortYear = year.toString().slice(-2);
        
        const label = `${getMonthName(month)} '${shortYear}`;
        const key = `${year}-${month}`;
        
        labels.push(label);
        counts.push(dataMap.get(key) || 0);
    }
    
    return { labels, counts };
};


export default function VisitorInsights() {
    const [chartData, setChartData] = useState({ labels: [], counts: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.getMonthlyActiveUsers();
                const formattedData = formatDataForChart(data);
                setChartData(formattedData);
            } catch (error) {
                console.error("Failed to fetch visitor insights:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const option = {
        color: ["#22C55E"],
        tooltip: {
            trigger: "axis",
            axisPointer: {
                lineStyle: { color: "#22C55E" },
            },
        },
        legend: { show: false },
        grid: { top: 20, left: 10, right: 10, bottom: 20, containLabel: true },
        xAxis: {
            type: "category",
            data: chartData.labels,
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
                formatter: '{value}'
            },
            splitLine: {
                lineStyle: { color: "#e5e7eb" }, // gray-200
            },
        },
        series: [
            {
                name: "Active Users",
                type: "line",
                data: chartData.counts,
                smooth: true,
                symbol: "circle",
                showSymbol: false,
                lineStyle: { width: 4 },
                areaStyle: {
                    color: 'rgba(34, 197, 94, 0.1)'
                }
            },
        ],
    };

    return (
        <div className="visitor-insights">
            <h3 className="insights-title">Monthly Active Users (Last 12 Months)</h3>
            
            <div style={{ height: 260, width: "100%" }}>
                {loading ? (
                    <p style={{ textAlign: 'center', paddingTop: '100px', color: '#6b7280' }}>
                        Loading Chart Data...
                    </p>
                ) : (
                    <ReactECharts
                        option={option}
                        style={{ height: '100%', width: '100%' }}
                        notMerge={true}
                        lazyUpdate={true}
                    />
                )}
            </div>
        </div>
    );
}
