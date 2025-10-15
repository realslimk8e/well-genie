import axios from "axios";
import type { WeekRow } from "./data";

export async function fetchWeek(): Promise<WeekRow[]> {
  const res = await axios.get("/api/metrics/week");
  return res.data as WeekRow[];
}
