// Validation utility functions for Risk Profile forms
import { useState } from 'react';

export const validateBHZ = (value) => {
  const num = Number(value);
  if (isNaN(num)) return { isValid: false, error: 'Harus angka' };
  if (num < 0) return { isValid: false, error: 'Tidak boleh negatif' };
  if (num > 100) return { isValid: false, error: 'Maksimal 100' };
  return { isValid: true, error: '' };
};

export const validateSkor = (value) => {
  const num = Number(value);
  if (isNaN(num)) return { isValid: false, error: 'Harus angka' };
  if (num < 1) return { isValid: false, error: 'Minimal 1' };
  if (num > 5) return { isValid: false, error: 'Maksimal 5' };
  return { isValid: true, error: '' };
};

export const validateBobotIndikator = (value) => {
  const num = Number(value);
  if (isNaN(num)) return { isValid: false, error: 'Harus angka' };
  if (num < 0) return { isValid: false, error: 'Tidak boleh negatif' };
  if (num > 100) return { isValid: false, error: 'Maksimal 100' };
  return { isValid: true, error: '' };
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  return { isValid: true, error: '' };
};

// Custom validation hook for form fields
export const useValidation = (initialState) => {
  const [errors, setErrors] = useState(initialState);

  const validateField = (field, value, validator) => {
    const validation = validator(value);
    setErrors((prev) => ({
      ...prev,
      [field]: validation.error,
    }));
    return validation.isValid;
  };

  const clearErrors = () => {
    setErrors(initialState);
  };

  const clearFieldError = (field) => {
    setErrors((prev) => ({
      ...prev,
      [field]: '',
    }));
  };

  const hasErrors = () => {
    return Object.values(errors).some((error) => error !== '');
  };

  const getFieldError = (field) => {
    return errors[field] || '';
  };

  return {
    errors,
    setErrors,
    validateField,
    clearErrors,
    clearFieldError,
    hasErrors,
    getFieldError,
  };
};
