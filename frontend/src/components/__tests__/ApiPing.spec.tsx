import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ApiPing from '../ApiPing';

describe('ApiPing', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('displays loading state initially', () => {
        render(<ApiPing />);
        expect(screen.getByText('Loading…')).toBeInTheDocument();
    });

    it('displays success message and data on successful fetch', async () => {
        const mockData = [{ id: 1, hours: 8 }];
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockData),
            } as Response)
        );

        render(<ApiPing />);

        await waitFor(() => {
            expect(screen.getByText('✅ /api/sleep loaded')).toBeInTheDocument();
        });

        expect(screen.getByText(/\[\s*\{\s*"id":\s*1,\s*"hours":\s*8\s*\}\s*\]/)).toBeInTheDocument();
    });

    it('displays error message on failed fetch', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response)
        );

        render(<ApiPing />);

        await waitFor(() => {
            expect(screen.getByText('❌ Error: HTTP 500')).toBeInTheDocument();
        });
    });
});
