import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSleep } from '../useSleep';

describe('useSleep', () => {
    beforeEach(() => {
        // Mock global fetch before each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial loading state', () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }));
        const { result } = renderHook(() => useSleep());

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should fetch sleep data successfully', async () => {
        const mockSleepItems = [
            { id: 1, date: '2023-01-01', hours: 7.5, quality: 'good' },
            { id: 2, date: '2023-01-02', hours: 8, quality: 'excellent' },
        ];
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ items: mockSleepItems }), { status: 200 }));

        const { result } = renderHook(() => useSleep());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual(mockSleepItems);
        expect(result.current.error).toBe(null);
    });

    it('should handle fetch error', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(null, { status: 401, statusText: 'Unauthorized' }));

        const { result } = renderHook(() => useSleep());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toContain('HTTP 401');
    });

    it('should handle network error', async () => {
        (global.fetch as vi.Mock).mockRejectedValueOnce(new TypeError('Network request failed'));

        const { result } = renderHook(() => useSleep());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(TypeError);
        expect((result.current.error as TypeError).message).toContain('Network request failed');
    });

    it('should not update state if component unmounts before fetch completes', async () => {
        const mockSleepItems = [
            { id: 1, date: '2023-01-01', hours: 7.5, quality: 'good' },
        ];
        let resolveFetch: (value: Response) => void;
        (global.fetch as vi.Mock).mockReturnValueOnce(
            new Promise(resolve => {
                resolveFetch = resolve;
            })
        );

        const { result, unmount } = renderHook(() => useSleep());

        // Initial state
        expect(result.current.loading).toBe(true);

        // Unmount the component
        unmount();

        // Resolve the fetch promise
        resolveFetch!(new Response(JSON.stringify({ items: mockSleepItems }), { status: 200 }));

        // Wait a bit to ensure any potential state updates would have happened
        await new Promise(resolve => setTimeout(resolve, 100));

        // State should not have changed from initial unmounted state
        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
    });
});