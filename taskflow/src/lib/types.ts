export interface Client {
  id: string;
  name: string;
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
}

export interface TimeEntry {
  start: string; // ISO date string
  end: string | null; // null means timer is running
}

export interface Task {
  id: string;
  name: string;
  clientId: string;
  projectId: string;
  notes: string;
  completed: boolean;
  timeEntries: TimeEntry[];
  createdAt: string; // ISO date string
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
}

export type ViewMode = "list" | "board";

export type Section = "tasks" | "clients" | "projects" | "reports";
