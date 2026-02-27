import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';

export const apiClient = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig) {
    return axios.get<T>(url, { withCredentials: true, ...config });
  },
  post<T = unknown>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<T>> {
    return axios.post<T>(url, data, { withCredentials: true, ...config });
  },
};
