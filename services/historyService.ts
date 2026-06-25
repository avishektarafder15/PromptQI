import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { HistoryItem } from '../types';

const STORAGE_KEY = 'promptqi_history_v1';

// Initialize Supabase if env vars are present or fall back to provided credentials
let supabase: SupabaseClient | null = null;

// Safe access to process.env
const getEnv = (key: string) => {
  try {
    return process.env[key];
  } catch (e) {
    return undefined;
  }
};

// Configuration using provided credentials
const supabaseUrl = getEnv('SUPABASE_URL') || 'https://nyrnbcwmjblomufmnwzp.supabase.co';
const supabaseKey = getEnv('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55cm5iY3dtamJsb211Zm1ud3pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MTgxNTgsImV4cCI6MjA3OTQ5NDE1OH0.abkNj5pTQUgGZT2BU6W7JN12SIEqosRvNgVhJLYTVik';

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (e) {
    console.error("Failed to initialize Supabase client:", e);
  }
}

const isSupabaseConfigured = (): boolean => {
  return !!supabase;
};

export const getStorageType = (): 'SUPABASE' | 'LOCAL' => {
  return isSupabaseConfigured() ? 'SUPABASE' : 'LOCAL';
};

export const getHistory = async (): Promise<HistoryItem[]> => {
  // 1. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data as HistoryItem[] || [];
    } catch (e) {
      console.error("Supabase load failed, falling back to local:", e);
    }
  }

  // 2. Fallback to LocalStorage
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load local history", e);
    return [];
  }
};

export const saveHistoryItem = async (item: HistoryItem): Promise<HistoryItem[]> => {
  // 1. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    try {
      // Use upsert to handle potential ID collisions gracefully
      const { error } = await supabase
        .from('history')
        .upsert([item]);
      
      if (error) throw error;
      
      // Return fresh list
      return getHistory();
    } catch (e) {
      console.error("Supabase save failed, falling back to local:", e);
    }
  }

  // 2. Fallback to LocalStorage
  try {
    const current = await getHistory(); // Get current (which will be local in this flow)
    const updated = [item, ...current].slice(0, 50);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error("Failed to save local history", e);
    return [];
  }
};

export const clearHistory = async (): Promise<void> => {
  // 1. Try Supabase
  if (isSupabaseConfigured() && supabase) {
    // We allow this to throw so the UI knows it failed
    const { error } = await supabase
      .from('history')
      .delete()
      .gt('timestamp', 0); // Delete all rows where timestamp > 0 (effectively all)
    
    if (error) throw error;
  }

  // 2. Clear LocalStorage regardless (good cleanup)
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error("Failed to clear local history", e);
  }
};

export const exportHistory = async (): Promise<void> => {
  try {
    const data = await getHistory();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
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

export const importHistory = async (jsonString: string): Promise<boolean> => {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Basic validation
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid format: Root must be an array");
    }
    
    if (parsed.length > 0) {
      const sample = parsed[0];
      if (!sample.id || !sample.original || !sample.result) {
        throw new Error("Invalid format: Missing required fields");
      }
    }

    // If using Supabase, we bulk upsert
    if (isSupabaseConfigured() && supabase) {
        const { error } = await supabase.from('history').upsert(parsed);
        if (error) throw error;
    } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    }

    return true;
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
};