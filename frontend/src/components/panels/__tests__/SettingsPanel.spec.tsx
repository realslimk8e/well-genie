import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SettingsPanel from '../SettingsPanel';

describe('SettingsPanel', () => {
    it('renders the settings panel with title and placeholder text', () => {
        render(<SettingsPanel />);

        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Preferences and profile controls coming soon.')).toBeInTheDocument();
    });
});
