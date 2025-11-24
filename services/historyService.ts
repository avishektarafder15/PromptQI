import { HistoryItem } from '../types';

const STORAGE_KEY = 'promptqi_history_v1';

export const getHistory = (): HistoryItem[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load history", e);
    return [];
  }
};

export const saveHistoryItem = (item: HistoryItem): HistoryItem[] => {
  try {
    const current = getHistory();
    // Add to beginning, limit to 50 items to prevent storage quota issues
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save history", e);
    return getHistory();
  }
};

export const clearHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear history", e);
  }
};

export const exportHistory = (): void => {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || '[]';
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptqi-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("Failed to export history", e);
  }
};

export const importHistory = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid format: Root must be an array");
    }
    
    // Check if items look like history items (check first item if exists)
    if (parsed.length > 0) {
      const sample = parsed[0];
      if (!sample.id || !sample.original || !sample.result) {
        throw new Error("Invalid format: Missing required fields");
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};