// src/context/ErrorContext.tsx
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import { ApiError } from '../services/api';

interface ErrorContextType {
  showError: (error: ApiError | Error | string) => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: ReactNode }) => {
  const showError = useCallback((error: ApiError | Error | string) => {
    let title = 'Error';
    let message = 'An unexpected error occurred';

    if (error instanceof ApiError) {
      title = getErrorTitle(error.code);
      message = error.message;
    } else if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    Alert.alert(title, message, [{ text: 'OK' }]);
  }, []);

  const clearError = useCallback(() => {
    // No-op for Alert-based errors, but useful if we switch to toast
  }, []);

  return (
    <ErrorContext.Provider value={{ showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

// Helper function to get user-friendly error titles
const getErrorTitle = (code: string): string => {
  const titles: Record<string, string> = {
    UNAUTHORIZED: 'Authentication Required',
    FORBIDDEN: 'Access Denied',
    NOT_FOUND: 'Not Found',
    VALIDATION_ERROR: 'Invalid Input',
    CONFLICT: 'Conflict',
    NETWORK_ERROR: 'Network Error',
    INTERNAL_SERVER_ERROR: 'Server Error',
  };

  return titles[code] || 'Error';
};