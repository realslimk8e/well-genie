import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
    const onNavigate = vi.fn();
    const onLogout = vi.fn();

    beforeEach(() => {
        onNavigate.mockClear();
        onLogout.mockClear();
    });

    it('renders all navigation items', () => {
        render(<Sidebar current="overview" onNavigate={onNavigate} onLogout={onLogout} />);

        expect(screen.getByText('Overview')).toBeInTheDocument();
        expect(screen.getByText('Sleep')).toBeInTheDocument();
        expect(screen.getByText('Diet')).toBeInTheDocument();
        expect(screen.getByText('Exercise')).toBeInTheDocument();
        expect(screen.getByText('Chatbot')).toBeInTheDocument();
        expect(screen.getByText('Import')).toBeInTheDocument();
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Log out')).toBeInTheDocument();
    });

    it('highlights the current tab', () => {
        render(<Sidebar current="diet" onNavigate={onNavigate} onLogout={onLogout} />);

        // The button itself has the aria-current attribute. We find it by its text content.
        const dietButton = screen.getByText('Diet').closest('button');
        expect(dietButton).toHaveAttribute('aria-current', 'page');

        const overviewButton = screen.getByText('Overview').closest('button');
        expect(overviewButton).not.toHaveAttribute('aria-current');
    });

    it('calls onNavigate with the correct key when a navigation item is clicked', () => {
        render(<Sidebar current="overview" onNavigate={onNavigate} onLogout={onLogout} />);

        const exerciseButton = screen.getByText('Exercise').closest('button');
        if (exerciseButton) {
            fireEvent.click(exerciseButton);
        }

        expect(onNavigate).toHaveBeenCalledWith('exercise');
    });

    it('calls onLogout when the logout button is clicked', () => {
        render(<Sidebar current="overview" onNavigate={onNavigate} onLogout={onLogout} />);

        const logoutButton = screen.getByText('Log out').closest('button');
        if (logoutButton) {
            fireEvent.click(logoutButton);
        }

        expect(onLogout).toHaveBeenCalled();
    });
});
