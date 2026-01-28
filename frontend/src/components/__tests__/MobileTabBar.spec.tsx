import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import MobileTabBar from '../MobileTabBar';

describe('MobileTabBar', () => {
    it('renders all navigation items', () => {
        const onNavigate = vi.fn();
        render(<MobileTabBar current="overview" onNavigate={onNavigate} />);

        expect(screen.getByLabelText('Home')).toBeInTheDocument();
        expect(screen.getByLabelText('Sleep')).toBeInTheDocument();
        expect(screen.getByLabelText('Diet')).toBeInTheDocument();
        expect(screen.getByLabelText('Exercise')).toBeInTheDocument();
        expect(screen.getByLabelText('Chatbot')).toBeInTheDocument();
    });

    it('highlights the current tab', () => {
        const onNavigate = vi.fn();
        render(<MobileTabBar current="sleep" onNavigate={onNavigate} />);

        const sleepButton = screen.getByLabelText('Sleep');
        expect(sleepButton).toHaveAttribute('aria-current', 'page');

        const homeButton = screen.getByLabelText('Home');
        expect(homeButton).not.toHaveAttribute('aria-current');
    });

    it('calls onNavigate with the correct key when an item is clicked', () => {
        const onNavigate = vi.fn();
        render(<MobileTabBar current="overview" onNavigate={onNavigate} />);

        const dietButton = screen.getByLabelText('Diet');
        fireEvent.click(dietButton);

        expect(onNavigate).toHaveBeenCalledWith('diet');
    });
});
