/**
 * Data store abstraction layer.
 *
 * Currently uses localStorage. When you're ready to add Supabase,
 * swap the implementation in this file — all components import from
 * here, so nothing else needs to change.
 */

import { AppData } from "./types";

const STORAGE_KEY = "taskmanager_data";

const DEFAULT_DATA: AppData = {
  clients: [],
  projects: [],
  tasks: [],
};

export function loadData(): AppData {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // Corrupted data — start fresh
  }
  return DEFAULT_DATA;
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
