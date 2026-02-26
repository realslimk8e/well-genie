import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { useSleep } from '../useSleep';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('useSleep', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial loading state', () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { items: [] } } as never);
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
        mockedAxios.get.mockResolvedValueOnce({ data: { items: mockSleepItems } } as never);

        const { result } = renderHook(() => useSleep());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual(mockSleepItems);
        expect(result.current.error).toBe(null);
    });

    it('should handle fetch error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new Error('HTTP 401'));

        const { result } = renderHook(() => useSleep());

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.items).toEqual([]);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toContain('HTTP 401');
    });

    it('should handle network error', async () => {
        mockedAxios.get.mockRejectedValueOnce(new TypeError('Network request failed'));

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
        let resolveRequest: (value: unknown) => void;
        mockedAxios.get.mockReturnValueOnce(
            new Promise(resolve => {
                resolveRequest = resolve;
            }) as never
        );

        const { result, unmount } = renderHook(() => useSleep());

        // Initial state
        expect(result.current.loading).toBe(true);

        // Unmount the component
        unmount();

        // Resolve the request promise
        resolveRequest!({ data: { items: mockSleepItems } });

        // Wait a bit to ensure any potential state updates would have happened
        await new Promise(resolve => setTimeout(resolve, 100));

        // State should not have changed from initial unmounted state
        expect(result.current.items).toEqual([]);
        expect(result.current.loading).toBe(true);
    });
});
