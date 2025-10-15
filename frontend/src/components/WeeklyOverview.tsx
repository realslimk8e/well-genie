import {
  ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip,
  BarChart, Bar
} from "recharts";
import type { WeekRow } from "../lib/data";

export default function WeeklyOverview({ data }: { data: WeekRow[] }) {
  return (
    <div className="card bg-base-100 border border-base-300">
      <div className="card-body gap-4">
        <div className="flex items-center justify-between">
          <h3 className="card-title text-base">This Week</h3>
          <span className="text-xs text-base-content/60">Overview</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip />
                <Line type="monotone" dataKey="sleepHrs" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-1 text-xs text-base-content/60">Sleep, hours</div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <XAxis dataKey="day" tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip />
                <Bar dataKey="steps" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-1 text-xs text-base-content/60">Steps</div>
          </div>
        </div>
      </div>
    </div>
  );
}
