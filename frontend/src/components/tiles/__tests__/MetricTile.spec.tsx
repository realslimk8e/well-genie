import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import MetricTile from '../MetricTile';

describe('MetricTile', () => {
    it('renders the title, value, and unit', () => {
        render(<MetricTile title="Test Metric" value={123} unit="units" />);
        expect(screen.getByText('Test Metric')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
        expect(screen.getByText('units')).toBeInTheDocument();
    });

    it('renders delta with up tone correctly', () => {
        render(<MetricTile title="Test Metric" value={10} delta="+5%" deltaTone="up" />);
        const deltaBadge = screen.getByText('+5%');
        expect(deltaBadge).toBeInTheDocument();
        expect(deltaBadge.className).toContain('badge-success');
    });

    it('renders delta with down tone correctly', () => {
        render(<MetricTile title="Test Metric" value={10} delta="-2%" deltaTone="down" />);
        const deltaBadge = screen.getByText('-2%');
        expect(deltaBadge).toBeInTheDocument();
        expect(deltaBadge.className).toContain('badge-error');
    });

    it('does not render delta when not provided', () => {
        render(<MetricTile title="Test Metric" value={10} />);
        expect(screen.queryByText(/%/)).toBeNull();
    });

    it('renders bars when provided', () => {
        const bars = [10, 20, 30, 40, 50];
        render(<MetricTile title="Test Metric" value={10} bars={bars} />);
        const renderedBars = screen.getAllByTestId('metric-bar');
        expect(renderedBars).toHaveLength(bars.length);
        renderedBars.forEach((bar, i) => {
            expect(bar).toHaveStyle(`height: ${Math.max(8, bars[i])}%`);
        });
    });

    it('renders with no unit and no bars', () => {
        render(<MetricTile title="Simple Metric" value={456} />);
        expect(screen.getByText('Simple Metric')).toBeInTheDocument();
        expect(screen.getByText('456')).toBeInTheDocument();
        expect(screen.queryByText('unit')).toBeNull(); // Ensure no unit is rendered
        expect(screen.queryAllByRole('img', { hidden: true })).toHaveLength(0); // Ensure no bars are rendered
    });

    it('handles string values for metric', () => {
        render(<MetricTile title="String Value" value="N/A" />);
        expect(screen.getByText('N/A')).toBeInTheDocument();
    });
});
