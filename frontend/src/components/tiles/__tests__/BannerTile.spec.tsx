import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BannerTile from '../BannerTile';

describe('BannerTile', () => {
    it('renders the banner with heading, text, and button', () => {
        render(<BannerTile />);

        expect(screen.getByText('Let’s level up your week')).toBeInTheDocument();
        expect(screen.getByText('Import your latest data and get AI tips.')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /View Insights/ })).toBeInTheDocument();
    });
});
