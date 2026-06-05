// src/features/Dashboard/pages/RiskProfile/pages/rekapdata/services/rekapDataAPI.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5530/api/v1';

export const rekapDataAPI = {
  // GET semua data triwulan
  getTriwulanData: (year, quarter) =>
    axios.get(`${API_BASE_URL}/rekap-data/triwulan/all`, {
      params: { year, quarter },
    }),

  // GET semua data tahunan
  getTahunanData: (year) =>
    axios.get(`${API_BASE_URL}/rekap-data/tahunan/all`, {
      params: { year },
    }),

  // POST update single row
  updateRow: (data) => axios.post(`${API_BASE_URL}/rekap-data/update`, data),

  // POST import Excel
  importExcel: (formData) =>
    axios.post(`${API_BASE_URL}/rekap-data/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  // GET sections untuk filter
  getSections: (source, year, quarter) =>
    axios.get(`${API_BASE_URL}/rekap-data/sections/${source}`, {
      params: { year, quarter },
    }),

  // DELETE cleanup duplicates
  cleanupDuplicates: (year, quarter) =>
    axios.delete(`${API_BASE_URL}/rekap-data/cleanup`, {
      params: { year, quarter },
    }),
};
