import { useState } from 'react';

export type SleepUnit = 'hours' | 'minutes';

export type UserPreferences = {
  dailyCalorieTarget: number;
  sleepUnit: SleepUnit;
};

export const PREFERENCES_STORAGE_KEY = 'wellgenie.preferences';

export const DEFAULT_PREFERENCES: UserPreferences = {
  dailyCalorieTarget: 2000,
  sleepUnit: 'hours',
};

export const clampCalorieTarget = (value: number) =>
  Math.max(1000, Math.min(5000, Math.round(value)));

export const normalizePreferences = (
  prefs: Partial<UserPreferences>,
): UserPreferences => {
  const sleepUnit: SleepUnit = prefs.sleepUnit === 'minutes' ? 'minutes' : 'hours';
  const dailyCalorieTarget = Number(prefs.dailyCalorieTarget);

  return {
    dailyCalorieTarget: Number.isFinite(dailyCalorieTarget)
      ? clampCalorieTarget(dailyCalorieTarget)
      : DEFAULT_PREFERENCES.dailyCalorieTarget,
    sleepUnit,
  };
};

export const loadPreferences = (): UserPreferences => {
  if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

  const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
  if (!raw) return DEFAULT_PREFERENCES;

  try {
    const parsed = JSON.parse(raw) as Partial<UserPreferences>;
    return normalizePreferences(parsed);
  } catch {
    return DEFAULT_PREFERENCES;
  }
};

export const savePreferencesToStorage = (prefs: UserPreferences) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(prefs));
};

export function usePreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);

  const savePreferences = (next: Partial<UserPreferences>) => {
    const normalized = normalizePreferences({ ...preferences, ...next });
    setPreferences(normalized);
    savePreferencesToStorage(normalized);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
    savePreferencesToStorage(DEFAULT_PREFERENCES);
  };

  return {
    preferences,
    savePreferences,
    resetPreferences,
  };
}
