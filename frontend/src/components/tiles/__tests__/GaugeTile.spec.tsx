import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import GaugeTile from '../GaugeTile';

describe('GaugeTile', () => {
    it('renders the title, percentage, and subtitle', () => {
        render(<GaugeTile title="My Gauge" percent={75} subtitle="Test Subtitle" />);

        expect(screen.getByText('My Gauge')).toBeInTheDocument();
        expect(screen.getByText('75%')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
    });

    it('renders the default subtitle when none is provided', () => {
        render(<GaugeTile title="My Gauge" percent={75} />);
        expect(screen.getByText('Deviation Index 2%')).toBeInTheDocument();
    });

    it('applies the success tone class by default', () => {
        render(<GaugeTile title="My Gauge" percent={75} />);
        const radialProgress = screen.getByText('75%');
        expect(radialProgress.className).toContain('text-success');
    });

    it('applies the warning tone class', () => {
        render(<GaugeTile title="My Gauge" percent={50} tone="warning" />);
        const radialProgress = screen.getByText('50%');
        expect(radialProgress.className).toContain('text-warning');
    });

    it('applies the error tone class', () => {
        render(<GaugeTile title="My Gauge" percent={25} tone="error" />);
        const radialProgress = screen.getByText('25%');
        expect(radialProgress.className).toContain('text-error');
    });

    it('applies the info tone class', () => {
        render(<GaugeTile title="My Gauge" percent={90} tone="info" />);
        const radialProgress = screen.getByText('90%');
        expect(radialProgress.className).toContain('text-info');
    });

    it('sets the --value CSS variable correctly', () => {
        render(<GaugeTile title="My Gauge" percent={42} />);
        const radialProgress = screen.getByText('42%');
        expect(radialProgress).toHaveStyle('--value: 42');
    });
});
