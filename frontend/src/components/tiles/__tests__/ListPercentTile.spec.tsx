import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ListPercentTile from '../ListPercentTile';

describe('ListPercentTile', () => {
    const mockRows = [
        { label: 'Protein', value: 40 },
        { label: 'Carbs', value: 50 },
        { label: 'Fat', value: 10 },
    ];

    it('renders the title', () => {
        render(<ListPercentTile title="Macro Split" rows={mockRows} />);
        expect(screen.getByText('Macro Split')).toBeInTheDocument();
    });

    it('renders all rows with their labels and percentage values', () => {
        render(<ListPercentTile title="Macro Split" rows={mockRows} />);

        mockRows.forEach(row => {
            expect(screen.getByText(row.label)).toBeInTheDocument();
            expect(screen.getByText(`${row.value}%`)).toBeInTheDocument();
        });
    });

    it('renders a progress bar for each row with correct value and max attributes', () => {
        render(<ListPercentTile title="Macro Split" rows={mockRows} />);

        const progressBars = screen.getAllByRole('progressbar');
        expect(progressBars).toHaveLength(mockRows.length);

        progressBars.forEach((bar, index) => {
            expect(bar).toHaveAttribute('value', mockRows[index].value.toString());
            expect(bar).toHaveAttribute('max', '100');
        });
    });

    it('renders correctly with an empty list of rows', () => {
        render(<ListPercentTile title="Empty List" rows={[]} />);
        expect(screen.getByText('Empty List')).toBeInTheDocument();
        expect(screen.queryByRole('progressbar')).toBeNull();
    });
});
