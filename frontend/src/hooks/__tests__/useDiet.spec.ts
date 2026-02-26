import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { useDiet } from '../useDiet';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('useDiet', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial loading state', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } } as never);
        const { result } = renderHook(() => useDiet());

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should fetch diet data successfully', async () => {
        const mockDietItems = [
            { id: 1, date: '2023-01-01', score: 80, protein_g: 50, carbs_g: 100, fat_g: 20, calories: 1000 },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: { items: mockDietItems } } as never);

        const { result } = renderHook(() => useDiet());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual(mockDietItems);
        expect(result.current.error).toBe(null);
    });

    it('should handle fetch error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('HTTP 404'));

        const { result } = renderHook(() => useDiet());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toContain('HTTP 404');
    });

    it('should handle network error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new TypeError('Network request failed'));

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
        let resolveRequest: (value: unknown) => void;
        mockedAxios.get.mockReturnValueOnce(
            new Promise(resolve => {
                resolveRequest = resolve;
            }) as never
        );

        const { result, unmount } = renderHook(() => useDiet());

        // Initial state
        expect(result.current.loading).toBe(true);

        // Unmount the component
        unmount();

        // Resolve the request promise
        resolveRequest!({ data: { items: mockDietItems } });

        // Wait a bit to ensure any potential state updates would have happened
        await new Promise(resolve => setTimeout(resolve, 100));

        // State should not have changed from initial unmounted state
        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
    });
});
