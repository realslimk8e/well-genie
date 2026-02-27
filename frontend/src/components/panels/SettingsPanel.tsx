import { useEffect, useState } from 'react';
import {
  DEFAULT_PREFERENCES,
  clampCalorieTarget,
  type SleepUnit,
  type UserPreferences,
} from '../../hooks/usePreferences';

type Props = {
  preferences: UserPreferences;
  onSavePreferences: (next: UserPreferences) => void;
  onResetPreferences: () => void;
};

export default function SettingsPanel({
  preferences,
  onSavePreferences,
  onResetPreferences,
}: Props) {
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(
    preferences.dailyCalorieTarget,
  );
  const [sleepUnit, setSleepUnit] = useState<SleepUnit>(preferences.sleepUnit);
  const [savedMessage, setSavedMessage] = useState<string>('');

  useEffect(() => {
    setDailyCalorieTarget(preferences.dailyCalorieTarget);
    setSleepUnit(preferences.sleepUnit);
  }, [preferences]);

  const handleSave = () => {
    onSavePreferences({
      dailyCalorieTarget: clampCalorieTarget(dailyCalorieTarget),
      sleepUnit,
    });
    setSavedMessage('Preferences saved.');
  };

  const handleReset = () => {
    setDailyCalorieTarget(DEFAULT_PREFERENCES.dailyCalorieTarget);
    setSleepUnit(DEFAULT_PREFERENCES.sleepUnit);
    onResetPreferences();
    setSavedMessage('Preferences reset to defaults.');
  };

  return (
    <div className="card bg-base-100 border-base-300 border">
      <div className="card-body space-y-5">
        <h2 className="card-title">Settings</h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="form-control">
            <span className="label-text mb-1 text-sm font-medium">
              Daily calorie target
            </span>
            <input
              type="number"
              min={1000}
              max={5000}
              step={50}
              className="input input-bordered w-full"
              value={dailyCalorieTarget}
              onChange={(e) =>
                setDailyCalorieTarget(
                  Number.isFinite(e.target.valueAsNumber)
                    ? e.target.valueAsNumber
                    : DEFAULT_PREFERENCES.dailyCalorieTarget,
                )
              }
            />
            <span className="mt-1 text-xs opacity-70">
              Range: 1000 to 5000 kcal
            </span>
          </label>

          <fieldset className="form-control">
            <legend className="label-text mb-2 text-sm font-medium">
              Preferred sleep units
            </legend>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="radio"
                name="sleep-unit"
                className="radio radio-primary radio-sm"
                checked={sleepUnit === 'hours'}
                onChange={() => setSleepUnit('hours')}
              />
              <span className="label-text">Hours</span>
            </label>
            <label className="label cursor-pointer justify-start gap-3">
              <input
                type="radio"
                name="sleep-unit"
                className="radio radio-primary radio-sm"
                checked={sleepUnit === 'minutes'}
                onChange={() => setSleepUnit('minutes')}
              />
              <span className="label-text">Minutes</span>
            </label>
          </fieldset>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn btn-primary btn-sm" onClick={handleSave}>
            Save preferences
          </button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>
            Reset defaults
          </button>
          {savedMessage && (
            <span className="text-success text-sm" role="status">
              {savedMessage}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
