import { useEffect, useState } from "react";

export function useLocalStorage(key: string, defaultValue: string) {
  const [value, setValue] = useState<string>(() => {
    if (typeof window === "undefined") return defaultValue;
    try {
      const stored = window.localStorage.getItem(key);
      return stored ?? defaultValue;
    } catch {
      return defaultValue;
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (value) {
        window.localStorage.setItem(key, value);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore storage errors
    }
  }, [key, value]);

  return [value, setValue] as const;
}
