import { useState, useEffect } from "react";

/**
 * A highly reusable hook that delays updating a value until after
 * a specified delay has passed since the last change.
 * 
 * @param {any} value - The value to debounce.
 * @param {number} delay - The debounce delay in milliseconds (default: 500ms).
 * @returns {any} The debounced value.
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
