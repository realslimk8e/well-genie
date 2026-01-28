import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDiet } from '../useDiet';

describe('useDiet', () => {
    beforeEach(() => {
        // Mock global fetch before each test
        global.fetch = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial loading state', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ items: [] }), { status: 200 }));
        const { result } = renderHook(() => useDiet());

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should fetch diet data successfully', async () => {
        const mockDietItems = [
            { id: 1, date: '2023-01-01', score: 80, protein_g: 50, carbs_g: 100, fat_g: 20, calories: 1000 },
        ];
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(JSON.stringify({ items: mockDietItems }), { status: 200 }));

        const { result } = renderHook(() => useDiet());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual(mockDietItems);
        expect(result.current.error).toBe(null);
    });

    it('should handle fetch error', async () => {
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(null, { status: 404, statusText: 'Not Found' }));

        const { result } = renderHook(() => useDiet());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toContain('HTTP 404');
    });

    it('should handle network error', async () => {
        (global.fetch as vi.Mock).mockRejectedValueOnce(new TypeError('Network request failed'));

        const { result } = renderHook(() => useDiet());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(TypeError);
        expect((result.current.error as TypeError).message).toContain('Network request failed');
    });

    it('should not update state if component unmounts before fetch completes', async () => {
        const mockDietItems = [
            { id: 1, date: '2023-01-01', score: 80, protein_g: 50, carbs_g: 100, fat_g: 20, calories: 1000 },
        ];
        let resolveFetch: (value: Response) => void;
        (global.fetch as vi.Mock).mockReturnValueOnce(
            new Promise(resolve => {
                resolveFetch = resolve;
            })
        );

        const { result, unmount } = renderHook(() => useDiet());

        // Initial state
        expect(result.current.loading).toBe(true);

        // Unmount the component
        unmount();

        // Resolve the fetch promise
        resolveFetch!(new Response(JSON.stringify({ items: mockDietItems }), { status: 200 }));

        // Wait a bit to ensure any potential state updates would have happened
        await new Promise(resolve => setTimeout(resolve, 100));

        // State should not have changed from initial unmounted state
        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
    });
});