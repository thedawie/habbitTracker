// src/utils/localStorage.ts
export const getFromLocalStorage = <T>(key: string, defaultValue: T, onError?: (error: Error) => void): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error getting key "${key}" from localStorage`, error);
    onError?.(error as Error);
    return defaultValue;
  }
};

export const setToLocalStorage = (key: string, value: any, onError?: (error: Error) => void): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting key "${key}" in localStorage`, error);
    onError?.(error as Error);
  }
};