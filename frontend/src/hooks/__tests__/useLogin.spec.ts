import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useLogin } from '../useLogin';

describe('useLogin', () => {
    beforeEach(() => {
        global.fetch = vi.fn();
        // Mock btoa as it's not available in jsdom by default
        global.btoa = vi.fn((str) => Buffer.from(str).toString('base64'));
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
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(JSON.stringify(mockResponse), { status: 200 }));

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('testuser', 'password');
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(global.fetch).toHaveBeenCalledWith('/api/login', expect.any(Object));
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(null);
        expect(loginResult).toEqual(mockResponse);
    });

    it('should handle login failure due to API error', async () => {
        const errorMessage = 'Invalid credentials';
        (global.fetch as vi.Mock).mockResolvedValueOnce(new Response(errorMessage, { status: 401, statusText: 'Unauthorized' }));

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('wronguser', 'wrongpass');
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeInstanceOf(Error);
        expect((result.current.error as Error).message).toBe(errorMessage);
        expect(loginResult).toBeUndefined(); // No data returned on error
    });

    it('should handle login failure due to network error', async () => {
        const networkError = new TypeError('Failed to fetch');
        (global.fetch as vi.Mock).mockRejectedValueOnce(networkError);

        const { result } = renderHook(() => useLogin());

        let loginResult;
        await act(async () => {
            loginResult = await result.current.login('testuser', 'password');
        });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBe(networkError);
        expect(loginResult).toBeUndefined();
    });

    it('should set loading state correctly during login', async () => {
        // Create a promise that we can control
        let resolveFetch: (value: Response) => void;
        const fetchPromise = new Promise<Response>(resolve => { resolveFetch = resolve; });
        (global.fetch as vi.Mock).mockReturnValueOnce(fetchPromise);

        const { result } = renderHook(() => useLogin());

        // Start the login call without awaiting
        let loginPromise: Promise<any>;
        act(() => {
            loginPromise = result.current.login('testuser', 'password');
        });

        // Wait for the loading state to update
        await waitFor(() => expect(result.current.loading).toBe(true));

        // Resolve the fetch promise
        act(() => {
            resolveFetch!(new Response(JSON.stringify({ message: 'Success' }), { status: 200 }));
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