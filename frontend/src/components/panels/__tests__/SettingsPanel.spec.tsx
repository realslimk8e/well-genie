import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import SettingsPanel from '../SettingsPanel';
import type { UserPreferences } from '../../../hooks/usePreferences';

const basePrefs: UserPreferences = {
  dailyCalorieTarget: 2000,
  sleepUnit: 'hours',
};

describe('SettingsPanel', () => {
  it('renders profile preference controls', () => {
    render(
      <SettingsPanel
        preferences={basePrefs}
        onSavePreferences={vi.fn()}
        onResetPreferences={vi.fn()}
      />,
    );

    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Daily calorie target')).toBeInTheDocument();
    expect(screen.getByText('Preferred sleep units')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save preferences/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /reset defaults/i })).toBeInTheDocument();
  });

  it('saves preferences and shows a confirmation', async () => {
    const user = userEvent.setup();
    const onSavePreferences = vi.fn();
    render(
      <SettingsPanel
        preferences={basePrefs}
        onSavePreferences={onSavePreferences}
        onResetPreferences={vi.fn()}
      />,
    );

    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '2400' } });
    await user.click(screen.getByLabelText('Minutes'));
    await user.click(screen.getByRole('button', { name: /save preferences/i }));

    expect(onSavePreferences).toHaveBeenCalledWith({
      dailyCalorieTarget: 2400,
      sleepUnit: 'minutes',
    });
    expect(screen.getByRole('status')).toHaveTextContent('Preferences saved.');
  });
});
