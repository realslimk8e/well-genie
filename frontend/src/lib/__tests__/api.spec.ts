import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { fetchWeek } from '../api';
import type { WeekRow } from '../data';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('api', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch week data successfully', async () => {
        const mockWeekData: WeekRow[] = [
            { day: 'Mon', sleepHrs: 7, steps: 8200 },
            { day: 'Tue', sleepHrs: 8, steps: 7600 },
        ];
        mockedAxios.get.mockResolvedValueOnce({ data: mockWeekData });

        const result = await fetchWeek();

        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/metrics/week');
        expect(result).toEqual(mockWeekData);
    });

    it('should handle fetch errors', async () => {
        const errorMessage = 'Network Error';
        mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

        await expect(fetchWeek()).rejects.toThrow(errorMessage);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith('/api/metrics/week');
    });
});
