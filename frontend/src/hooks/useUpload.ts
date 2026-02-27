import { useState } from 'react';
import axios from 'axios';
import { apiClient } from '../lib/apiClient';

interface UploadResult {
  message: string;
  filename: string;
  category: string;
  inserted: number;
  errors: string[] | null;
}

interface UploadError {
  errors: string[];
  detected_headers?: string[];
}

export function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadResult | null> => {
    setUploading(true);
    setError(null);
    setLastResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<UploadResult>(
        '/api/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );

      setLastResult(response.data);
      return response.data;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 400 && err.response?.data?.detail) {
          const detail = err.response.data.detail as UploadError;
          const errorMessages = detail.errors || [];
          const partialResult: UploadResult = {
            message: 'Validation failed',
            filename: file.name,
            category: 'unknown',
            inserted: 0,
            errors: errorMessages,
          };

          setLastResult(partialResult);
          return partialResult;
        } else {
          setError(
            err.response?.data?.message || err.message || 'Upload failed',
          );
        };
      } else if (err instanceof Error) {
        setError(err.message);
      }
      return null;
    } finally {
      setUploading(false);
    }
  };

  const clearError = () => setError(null);
  const clearResult = () => setLastResult(null);

  return {
    uploadFile,
    uploading,
    lastResult,
    error,
    clearError,
    clearResult,
  };
}
