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

export interface SyncMeta {
  provider: IntegrationProvider;
  externalId: string;
  lastSynced: string; // ISO date string
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
  syncMeta?: SyncMeta[]; // tracks linked external tasks
}

export interface AppData {
  clients: Client[];
  projects: Project[];
  tasks: Task[];
  integrations?: IntegrationConfig[];
}

export type ViewMode = "list" | "board";

export type Section = "tasks" | "clients" | "projects" | "reports" | "integrations";

// ============================================================
// Integrations
// ============================================================

export type IntegrationProvider = "trello" | "clickup" | "asana" | "monday";

export interface IntegrationConfig {
  provider: IntegrationProvider;
  enabled: boolean;
  credentials: Record<string, string>; // e.g. { apiKey, token, boardId }
  syncSettings: {
    importCompleted: boolean;
    autoSync: boolean;
    defaultClientId: string;
    defaultProjectId: string;
    boardOrProjectId: string; // the specific board/project/list to sync
  };
  lastSynced: string | null;
}

export interface ExternalTask {
  externalId: string;
  name: string;
  completed: boolean;
  description: string;
  listOrStatus: string; // column name / status
}
