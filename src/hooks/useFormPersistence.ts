"use client";

import { useState, useEffect, useCallback } from "react";

export function useFormPersistence<T>(storageKey: string, initialData: T) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to parse persisted form data", e);
      }
    }
    setIsLoaded(true);
  }, [storageKey]);

  // Update a single field and persist to localStorage
  const updateField = useCallback((name: string, value: any) => {
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      localStorage.setItem(storageKey, JSON.stringify(newState));
      return newState;
    });
  }, [storageKey]);

  // Clear persistence after successful submission
  const clearPersistence = useCallback(() => {
    localStorage.removeItem(storageKey);
    setFormData(initialData);
  }, [storageKey, initialData]);

  return { formData, updateField, clearPersistence, isLoaded };
}
