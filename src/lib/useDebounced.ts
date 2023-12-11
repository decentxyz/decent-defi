import { useState, useEffect, useRef } from "react";

export default function useDebounced<T>(
  value: T,
  delayMs = 500,
): [T, (val: T) => void] {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delayMs);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, [value, delayMs]);

  const overrideValue = (value: T) => {
    // note: value isn't updated here
    setDebouncedValue(value);
    clearTimeout(timeoutRef.current);
  };

  return [debouncedValue, overrideValue];
}
