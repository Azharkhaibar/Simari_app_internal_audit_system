// src/features/Dashboard/pages/Ringkasan/services/ringkasanAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5530/api/v1';

export const ringkasanAPI = {
  getRingkasanData: (year, quarter) =>
    axios.get(`${API_BASE_URL}/ringkasan/all`, {
      params: { year, quarter },
    }),
};
