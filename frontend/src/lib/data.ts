export type WeekRow = { day: string; sleepHrs: number; steps: number };

export const mockWeek: WeekRow[] = [
  { day: 'Mon', sleepHrs: 7.8, steps: 8290 },
  { day: 'Tue', sleepHrs: 8.2, steps: 7120 },
  { day: 'Wed', sleepHrs: 7.1, steps: 10020 },
  { day: 'Thu', sleepHrs: 6.9, steps: 9540 },
  { day: 'Fri', sleepHrs: 8.5, steps: 6780 },
  { day: 'Sat', sleepHrs: 9.0, steps: 12030 },
  { day: 'Sun', sleepHrs: 8.0, steps: 8450 },
];
