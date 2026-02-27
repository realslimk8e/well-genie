import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { useLogin } from '../useLogin';

vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('useLogin', () => {
    beforeEach(() => {
        // Mock btoa as it's not available in jsdom by default
        global.btoa = vi.fn((str) => Buffer.from(str).toString('base64'));
        vi.clearAllMocks();
        mockedAxios.isAxiosError.mockImplementation(
          (value) => !!(value as { isAxiosError?: boolean })?.isAxiosError,
        );
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useLogin());
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });

    it('should handle successful login', async () => {
        const mockResponse = { message: 'Login successful' };
        mockedAxios.post.mockResolvedValueOnce({ data: mockResponse } as never);

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('testuser', 'password');
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          '/api/login',
          undefined,
          expect.objectContaining({
            headers: expect.objectContaining({
              Authorization: expect.stringContaining('Basic '),
            }),
            withCredentials: true,
          }),
        );
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(loginResult).toEqual(mockResponse);
    });

    it('should handle login failure due to API error', async () => {
        const errorMessage = 'Invalid credentials';
        mockedAxios.post.mockRejectedValueOnce({
          isAxiosError: true,
          message: 'Request failed with status code 401',
          response: { data: errorMessage },
        });

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('wronguser', 'wrongpass');
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toBe(errorMessage);
        expect(loginResult).toBeUndefined(); // No data returned on error
    });

    it('should handle login failure due to network error', async () => {
        const networkError = new Error('Network Error');
        mockedAxios.post.mockRejectedValueOnce({
          isAxiosError: true,
          message: 'Network Error',
          response: undefined,
        });

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('testuser', 'password');
        });

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toBe(networkError.message);
        expect(loginResult).toBeUndefined();
    });

    it('should set loading state correctly during login', async () => {
        // Create a promise that we can control
        let resolveRequest: (value: unknown) => void;
        const requestPromise = new Promise(resolve => { resolveRequest = resolve; });
        mockedAxios.post.mockReturnValueOnce(requestPromise as never);

        const { result } = renderHook(() => useLogin());

        // Start the login call without awaiting
        let loginPromise: Promise<unknown>;
        act(() => {
            loginPromise = result.current.login('testuser', 'password');
        });

        // Wait for the loading state to update
        await waitFor(() => expect(result.current.loading).toBe(true));

        // Resolve the request promise
        act(() => {
            resolveRequest!({ data: { message: 'Success' } });
        });

        // Wait for the login to complete
        await act(async () => {
            await loginPromise!;
        });

        // Should no longer be loading
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
    });
});
