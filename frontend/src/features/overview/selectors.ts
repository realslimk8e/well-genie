import type { DietItem } from '../../hooks/useDiet';
import type { ExerciseItem } from '../../hooks/useExercise';
import type { SleepItem } from '../../hooks/useSleep';

type SleepQuality = SleepItem['quality'];

const q2s: Record<SleepQuality, number> = {
  excellent: 4,
  good: 3,
  fair: 2,
  poor: 1,
};

const avgNum = <T,>(arr: T[], pick: (x: T) => number) =>
  arr.length
    ? Math.round(arr.reduce((sum, x) => sum + pick(x), 0) / arr.length)
    : 0;

const getExerciseMinutes = (x: ExerciseItem) =>
  x?.minutes ?? x?.duration_min ?? x?.duration ?? 0;

export function getOverviewStats(
  sleepItems: SleepItem[],
  dietItems: DietItem[],
  exItems: ExerciseItem[],
) {
  const sleepLast7 = sleepItems.slice(-7);
  const sleepAvgHours = sleepLast7.length
    ? (
        sleepLast7.reduce((sum, row) => sum + (row?.hours ?? 0), 0) /
        sleepLast7.length
      ).toFixed(1)
    : '0.0';

  const sleepAvgQScore = sleepLast7.length
    ? sleepLast7.reduce((sum, row) => sum + (q2s[row?.quality] ?? 0), 0) /
      sleepLast7.length
    : 0;

  const dietLast7 = dietItems.slice(-7);
  const avgProtein = avgNum(dietLast7, (d) => d?.protein_g ?? 0);
  const avgCarbs = avgNum(dietLast7, (d) => d?.carbs_g ?? 0);
  const avgFat = avgNum(dietLast7, (d) => d?.fat_g ?? 0);
  const avgCals = avgNum(dietLast7, (d) => d?.calories ?? 0);

  const exToday = exItems.length ? getExerciseMinutes(exItems.at(-1)!) : 0;

  return {
    sleepAvgHours,
    sleepAvgQScore,
    avgProtein,
    avgCarbs,
    avgFat,
    avgCals,
    exToday,
  };
}

export type OverviewStats = ReturnType<typeof getOverviewStats>;
