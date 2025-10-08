import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";
import "./TargetVsReality.css";
import ShoppingBag from "../assets/icons/Bag 1.svg"
import BadgeIcon from "../assets/icons/Ticket Star 1.svg"

/** Data heights tuned to visually match the Figma bars */
const data = [
  { name: "Jan", reality: 170, target: 210 },
  { name: "Feb", reality: 150, target: 190 },
  { name: "Mar", reality: 125, target: 250 },
  { name: "Apr", reality: 170, target: 195 },
  { name: "May", reality: 205, target: 255 },
  { name: "June", reality: 205, target: 255 },
  { name: "July", reality: 202, target: 255 },
];

export default function TargetVsReality() {
  return (
    <div className="tvr">
      <h3 className="tvr__title">Target vs Reality</h3>

      <div className="tvr__chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 6, right: 10, bottom: 10, left: 4 }}
            barCategoryGap="36%"   /* space between month groups */
            barGap={12}            /* space between reality/target */
          >
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#9AA6B2", fontSize: 14, dy: 4 }}
            />
            <YAxis hide domain={[0, 270]} />
            <Tooltip cursor={{ stroke: "#ccc", strokeWidth: 1 }} />
            <Bar
              dataKey="reality"
              fill="#2DC7A6"
              radius={[4, 4, 0, 0]}
              barSize={22}
            />
            <Bar
              dataKey="target"
              fill="#F5C443"
              radius={[4, 4, 0, 0]}
              barSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="tvr__legend">
        <div className="tvr__legendItem">
          <div className="tvr__icon tvr__icon--reality" aria-hidden>
            {/* shopping-bag icon */}
            <img src={ShoppingBag} alt="Shopping bag" />
          </div>
          <div className="tvr__legendText">
            <span className="tvr__legendTitle">Reality Sales</span>
            <span className="tvr__legendSub">Global</span>
          </div>
          <span className="tvr__legendValue tvr__legendValue--green">
            8.823
          </span>
        </div>

        <div className="tvr__legendItem">
          <div className="tvr__icon tvr__icon--target" aria-hidden>
            {/* badge icon */}
            <img src={BadgeIcon} alt="Badge" />
          </div>
          <div className="tvr__legendText">
            <span className="tvr__legendTitle">Target Sales</span>
            <span className="tvr__legendSub">Commercial</span>
          </div>
          <span className="tvr__legendValue tvr__legendValue--orange">
            12.122
          </span>
        </div>
      </div>
    </div>
  );
}
