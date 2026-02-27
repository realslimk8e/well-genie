import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { useExercise } from '../useExercise';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('useExercise', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial loading state', () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } } as never);
        const { result } = renderHook(() => useExercise());

        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);
    });

    it('should fetch exercise data successfully', async () => {
        const mockExerciseItems = [
            { id: 1, date: '2023-01-01', minutes: 30, steps: 5000, calories_burned: 300 },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: { items: mockExerciseItems } } as never);

        const { result } = renderHook(() => useExercise());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual(mockExerciseItems);
        expect(result.current.error).toBe(null);
    });

    it('should handle fetch error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('HTTP 500'));

        const { result } = renderHook(() => useExercise());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toContain('HTTP 500');
    });

    it('should handle network error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new TypeError('Network request failed'));

        const { result } = renderHook(() => useExercise());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(TypeError);
        expect((result.current.error as TypeError).message).toContain('Network request failed');
    });

    it('should not update state if component unmounts before fetch completes', async () => {
        const mockExerciseItems = [
            { id: 1, date: '2023-01-01', minutes: 30, steps: 5000, calories_burned: 300 },
        ];
        let resolveRequest: (value: unknown) => void;
        mockedAxios.get.mockReturnValueOnce(
            new Promise(resolve => {
                resolveRequest = resolve;
            }) as never
        );

        const { result, unmount } = renderHook(() => useExercise());

        // Initial state
        expect(result.current.loading).toBe(true);

        // Unmount the component
        unmount();

        // Resolve the request promise
        resolveRequest!({ data: { items: mockExerciseItems } });

        // Wait a bit to ensure any potential state updates would have happened
        await new Promise(resolve => setTimeout(resolve, 100));

        // State should not have changed from initial unmounted state
        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
    });
});
