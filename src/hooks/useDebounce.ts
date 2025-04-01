import { useEffect, useState } from "react";

// Custom hook for debouncing a value with a minimum length
export const useDebounce = <T>(value: T, delay = 500, minLength = 3) => {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  // Effect to update the debounced value after a specified delay
  useEffect(() => {
    // Check if the length of the value meets the minimum length requirement
    if (typeof value === 'string' && value.length >= minLength) {
      // Set a timeout to update the debounced value
      const timeout = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Cleanup function to clear the timeout when the component unmounts
      return () => clearTimeout(timeout);
    } else {
      // If the length is less than the minimum, update immediately without a delay
      setDebouncedValue(value);
    }
  }, [value, delay, minLength]);

  // Return the debounced value
  return debouncedValue;
};
