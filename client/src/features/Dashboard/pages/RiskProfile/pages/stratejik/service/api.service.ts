// services/api.service.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = 'http://localhost:5530/api/v1';

// Buat instance axios untuk stratejik
export const api_stratejik = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptor untuk logging error
api_stratejik.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    console.error('❌ [STRATEJIK API] Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });

    // Throw error dengan pesan yang lebih jelas
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
  }
);

export default api_stratejik;
