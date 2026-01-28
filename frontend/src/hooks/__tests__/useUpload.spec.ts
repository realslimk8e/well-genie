import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { useUpload } from '../useUpload';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('useUpload', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return initial state', () => {
        const { result } = renderHook(() => useUpload());
        expect(result.current.uploading).toBe(false);
        expect(result.current.lastResult).toBe(null);
        expect(result.current.error).toBe(null);
    });

    it('should handle successful file upload', async () => {
        const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
        const mockUploadResult = {
            message: 'Upload successful',
            filename: 'test.csv',
            category: 'diet',
            inserted: 10,
            errors: null,
        };
        mockedAxios.post.mockResolvedValueOnce({ data: mockUploadResult });

        const { result } = renderHook(() => useUpload());

        let uploadPromise;
        act(() => {
            uploadPromise = result.current.uploadFile(mockFile);
        });

        expect(result.current.uploading).toBe(true);

        const uploadResult = await uploadPromise;

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.post).toHaveBeenCalledWith(
            '/api/upload',
            expect.any(FormData),
            expect.any(Object),
        );
        await waitFor(() => expect(result.current.uploading).toBe(false));
        expect(result.current.lastResult).toEqual(mockUploadResult);
        expect(result.current.error).toBe(null);
        expect(uploadResult).toEqual(mockUploadResult);
    });

    it('should handle 400 Bad Request with validation errors', async () => {
        const mockFile = new File(['bad content'], 'bad.csv', { type: 'text/csv' });
        const mockErrorResponse = {
            response: {
                status: 400,
                data: {
                    detail: {
                        errors: ['Invalid header', 'Missing data'],
                        detected_headers: ['col1', 'col2']
                    }
                }
            }
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.post.mockRejectedValueOnce(mockErrorResponse);

        const { result } = renderHook(() => useUpload());

        let uploadPromise;
        act(() => {
            uploadPromise = result.current.uploadFile(mockFile);
        });

        expect(result.current.uploading).toBe(true);

        const uploadResult = await uploadPromise;

        await waitFor(() => expect(result.current.uploading).toBe(false));
        expect(result.current.lastResult).toEqual({
            message: 'Validation failed',
            filename: 'bad.csv',
            category: 'unknown',
            inserted: 0,
            errors: ['Invalid header', 'Missing data'],
        });
        expect(result.current.error).toBe(null); // Error is stored in lastResult.errors, not error state
        expect(uploadResult).toEqual({
            message: 'Validation failed',
            filename: 'bad.csv',
            category: 'unknown',
            inserted: 0,
            errors: ['Invalid header', 'Missing data'],
        });
    });

    it('should handle generic Axios error', async () => {
        const mockFile = new File(['content'], 'generic.csv', { type: 'text/csv' });
        const mockAxiosError = {
            message: 'Network Error',
            isAxiosError: true,
            response: undefined,
            name: 'AxiosError',
            config: {},
            toJSON: vi.fn(),
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.post.mockRejectedValueOnce(mockAxiosError);

        const { result } = renderHook(() => useUpload());

        let uploadPromise;
        act(() => {
            uploadPromise = result.current.uploadFile(mockFile);
        });

        expect(result.current.uploading).toBe(true);

        const uploadResult = await uploadPromise;

        await waitFor(() => expect(result.current.uploading).toBe(false));
        expect(result.current.lastResult).toBe(null);
        expect(result.current.error).toBe('Network Error');
        expect(uploadResult).toBe(null);
    });

    it('should handle non-Axios error', async () => {
        const mockFile = new File(['content'], 'nonaxios.csv', { type: 'text/csv' });
        const mockError = new Error('Something went wrong');
        mockedAxios.isAxiosError.mockReturnValue(false); // Ensure it's not treated as an Axios error
        mockedAxios.post.mockRejectedValueOnce(mockError);

        const { result } = renderHook(() => useUpload());

        let uploadPromise;
        act(() => {
            uploadPromise = result.current.uploadFile(mockFile);
        });

        expect(result.current.uploading).toBe(true);

        const uploadResult = await uploadPromise;

        await waitFor(() => expect(result.current.uploading).toBe(false));
        expect(result.current.lastResult).toBe(null);
        expect(result.current.error).toBe('Something went wrong');
        expect(uploadResult).toBe(null);
    });

    it('should clear error state', async () => {
        const mockFile = new File(['content'], 'error.csv', { type: 'text/csv' });
        const mockAxiosError = {
            message: 'Upload failed',
            isAxiosError: true,
            response: undefined,
            name: 'AxiosError',
            config: {},
            toJSON: vi.fn(),
        };
        mockedAxios.isAxiosError.mockReturnValue(true);
        mockedAxios.post.mockRejectedValueOnce(mockAxiosError);

        const { result } = renderHook(() => useUpload());

        await act(async () => {
            await result.current.uploadFile(mockFile);
        });

        expect(result.current.error).toBe('Upload failed');

        act(() => {
            result.current.clearError();
        });

        expect(result.current.error).toBe(null);
    });

    it('should clear lastResult state', async () => {
        const mockFile = new File(['test content'], 'test.csv', { type: 'text/csv' });
        const mockUploadResult = {
            message: 'Upload successful',
            filename: 'test.csv',
            category: 'diet',
            inserted: 10,
            errors: null,
        };
        mockedAxios.post.mockResolvedValueOnce({ data: mockUploadResult });

        const { result } = renderHook(() => useUpload());

        await act(async () => {
            await result.current.uploadFile(mockFile);
        });

        expect(result.current.lastResult).toEqual(mockUploadResult);

        act(() => {
            result.current.clearResult();
        });

        expect(result.current.lastResult).toBe(null);
    });
});