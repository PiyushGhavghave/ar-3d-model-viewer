import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import "./VolumeServiceLevel.css";

const data = [
  { name: "Mon", volume: 720, services: 310 },
  { name: "Tue", volume: 980, services: 360 },
  { name: "Wed", volume: 920, services: 420 },
  { name: "Thu", volume: 860, services: 250 },
  { name: "Fri", volume: 620, services: 230 },
  { name: "Sat", volume: 700, services: 340 },
];

export default function VolumeServiceLevel() {
  return (
    <div className="volume-service card">
      <h2>Volume vs Service Level</h2>

      <div className="chart-surface">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={data}
            margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            barCategoryGap="60%"   // <— makes bars slim like Figma
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7ECF2" />
            <XAxis hide />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: "rgba(17, 24, 39, 0.04)" }}
              contentStyle={{ borderRadius: 10, border: "1px solid #E5E7EB" }}
            />
            {/* stacked: green base + blue top */}
            <Bar dataKey="services" stackId="a" fill="#10B981" maxBarSize={14} />
            <Bar dataKey="volume"   stackId="a" fill="#3B82F6" maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="legend compact">
        <div className="legend-item">
          <span className="dot blue" />
          <span className="label">Volume</span>
          <span className="value">1,135</span>
        </div>

        <div className="divider" />

        <div className="legend-item">
          <span className="dot green" />
          <span className="label">Services</span>
          <span className="value">635</span>
        </div>
      </div>
    </div>
  );
}
