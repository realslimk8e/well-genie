import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import QuickStatsCard from '../QuickStatsCard';

describe('QuickStatsCard', () => {
    const mockItems = [
        { label: 'Stat 1', value: 100, unit: 'kg' },
        { label: 'Stat 2', value: '25%' },
        { label: 'A very long stat label to check wrapping and overflow', value: 3.14, unit: 'pi' },
    ];

    it('renders the title', () => {
        render(<QuickStatsCard title="My Stats" items={mockItems} />);
        expect(screen.getByText('My Stats')).toBeInTheDocument();
    });

    it('renders all stat items with their labels and values', () => {
        render(<QuickStatsCard title="My Stats" items={mockItems} />);

        mockItems.forEach(item => {
            expect(screen.getByText(item.label)).toBeInTheDocument();
            expect(screen.getByText(item.value.toString())).toBeInTheDocument();
        });
    });

    it('renders units when provided', () => {
        render(<QuickStatsCard title="My Stats" items={mockItems} />);

        expect(screen.getByText('kg')).toBeInTheDocument();
        expect(screen.getByText('pi')).toBeInTheDocument();
    });

    it('does not render a unit when it is not provided', () => {
        render(<QuickStatsCard title="My Stats" items={mockItems} />);
        
        const stat2Value = screen.getByText('25%');
        // This is a bit tricky. We want to make sure there's no "unit" element next to 25%.
        // The unit for 'kg' and 'pi' exists, but not for '25%'.
        expect(stat2Value.nextElementSibling).toBeNull();
    });

    it('renders correctly with an empty list of items', () => {
        render(<QuickStatsCard title="Empty Stats" items={[]} />);
        expect(screen.getByText('Empty Stats')).toBeInTheDocument();
        // Check that no stat items are rendered
        expect(screen.queryByTestId('quick-stat-item')).toBeNull();
    });
});
