// services/reputasi.api.service.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5530/api/v1';

export const api_reputasi_produk = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

api_reputasi_produk.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('❌ [reputasi produk API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    if (error.response?.data) {
      const data = error.response.data as any;
      if (data.message) {
        if (Array.isArray(data.message)) {
          const messages = data.message.map((item: any) => {
            if (item.constraints) {
              const field = item.property || 'field';
              const errors = Object.values(item.constraints).join(', ');
              return `${field}: ${errors}`;
            }
            return typeof item === 'string' ? item : JSON.stringify(item);
          });
          error.message = messages.join('\n');
        } else {
          error.message = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
        }
      }
    }

    return Promise.reject(error);
  },
);

export default api_reputasi_produk;
