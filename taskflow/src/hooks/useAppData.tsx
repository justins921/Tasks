"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { AppData, Client, Project, Task, IntegrationConfig } from "@/lib/types";
import { loadData, saveData } from "@/lib/store";
import { genId } from "@/lib/utils";

interface AppContextValue {
  data: AppData;
  // Clients
  addClient: (name: string) => void;
  renameClient: (id: string, name: string) => void;
  deleteClient: (id: string) => void;
  // Projects
  addProject: (clientId: string, name: string) => void;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  // Tasks
  addTask: (task: Pick<Task, "name" | "clientId" | "projectId" | "notes">) => void;
  updateTask: (id: string, updates: Partial<Pick<Task, "name" | "clientId" | "projectId" | "notes">>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  // Timer
  startTimer: (taskId: string) => void;
  stopTimer: (taskId: string) => void;
  // Time entries
  deleteTimeEntry: (taskId: string, idx: number) => void;
  addManualTimeEntry: (taskId: string) => void;
  updateTimeEntry: (taskId: string, idx: number, start: string, end: string | null) => void;
  // Kanban drag
  moveTaskToColumn: (taskId: string, column: "todo" | "inprogress" | "done") => void;
  // Integrations
  setIntegrations: (configs: IntegrationConfig[], tasks: Task[]) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>({ clients: [], projects: [], tasks: [] });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setData(loadData());
    setLoaded(true);
  }, []);

  const update = useCallback((fn: (prev: AppData) => AppData) => {
    setData((prev) => {
      const next = fn(prev);
      saveData(next);
      return next;
    });
  }, []);

  // ---- Clients ----
  const addClient = useCallback(
    (name: string) => {
      update((d) => ({
        ...d,
        clients: [...d.clients, { id: genId(), name }],
      }));
    },
    [update]
  );

  const renameClient = useCallback(
    (id: string, name: string) => {
      update((d) => ({
        ...d,
        clients: d.clients.map((c) => (c.id === id ? { ...c, name } : c)),
      }));
    },
    [update]
  );

  const deleteClient = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        clients: d.clients.filter((c) => c.id !== id),
        projects: d.projects.filter((p) => p.clientId !== id),
        tasks: d.tasks.map((t) =>
          t.clientId === id ? { ...t, clientId: "", projectId: "" } : t
        ),
      }));
    },
    [update]
  );

  // ---- Projects ----
  const addProject = useCallback(
    (clientId: string, name: string) => {
      update((d) => ({
        ...d,
        projects: [...d.projects, { id: genId(), clientId, name }],
      }));
    },
    [update]
  );

  const renameProject = useCallback(
    (id: string, name: string) => {
      update((d) => ({
        ...d,
        projects: d.projects.map((p) => (p.id === id ? { ...p, name } : p)),
      }));
    },
    [update]
  );

  const deleteProject = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        projects: d.projects.filter((p) => p.id !== id),
        tasks: d.tasks.map((t) =>
          t.projectId === id ? { ...t, projectId: "" } : t
        ),
      }));
    },
    [update]
  );

  // ---- Tasks ----
  const addTask = useCallback(
    (task: Pick<Task, "name" | "clientId" | "projectId" | "notes">) => {
      update((d) => ({
        ...d,
        tasks: [
          ...d.tasks,
          {
            ...task,
            id: genId(),
            completed: false,
            timeEntries: [],
            createdAt: new Date().toISOString(),
          },
        ],
      }));
    },
    [update]
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<Task, "name" | "clientId" | "projectId" | "notes">>) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
    },
    [update]
  );

  const deleteTask = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.filter((t) => t.id !== id),
      }));
    },
    [update]
  );

  const toggleComplete = useCallback(
    (id: string) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== id) return t;
          const nowIso = new Date().toISOString();
          // If marking complete, stop running timer
          const entries = !t.completed
            ? t.timeEntries.map((e) =>
                e.end === null ? { ...e, end: nowIso } : e
              )
            : t.timeEntries;
          return { ...t, completed: !t.completed, timeEntries: entries };
        }),
      }));
    },
    [update]
  );

  // ---- Timer ----
  const startTimer = useCallback(
    (taskId: string) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          if (t.timeEntries.some((e) => e.end === null)) return t;
          return {
            ...t,
            timeEntries: [
              ...t.timeEntries,
              { start: new Date().toISOString(), end: null },
            ],
          };
        }),
      }));
    },
    [update]
  );

  const stopTimer = useCallback(
    (taskId: string) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            timeEntries: t.timeEntries.map((e) =>
              e.end === null ? { ...e, end: new Date().toISOString() } : e
            ),
          };
        }),
      }));
    },
    [update]
  );

  // ---- Time entries ----
  const deleteTimeEntry = useCallback(
    (taskId: string, idx: number) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            timeEntries: t.timeEntries.filter((_, i) => i !== idx),
          };
        }),
      }));
    },
    [update]
  );

  const addManualTimeEntry = useCallback(
    (taskId: string) => {
      const end = new Date();
      const start = new Date(end.getTime() - 3600000);
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            timeEntries: [
              ...t.timeEntries,
              { start: start.toISOString(), end: end.toISOString() },
            ],
          };
        }),
      }));
    },
    [update]
  );

  const updateTimeEntry = useCallback(
    (taskId: string, idx: number, start: string, end: string | null) => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          return {
            ...t,
            timeEntries: t.timeEntries.map((e, i) =>
              i === idx ? { start, end } : e
            ),
          };
        }),
      }));
    },
    [update]
  );

  // ---- Kanban drag ----
  const moveTaskToColumn = useCallback(
    (taskId: string, column: "todo" | "inprogress" | "done") => {
      update((d) => ({
        ...d,
        tasks: d.tasks.map((t) => {
          if (t.id !== taskId) return t;
          const nowIso = new Date().toISOString();
          if (column === "done") {
            const entries = t.timeEntries.map((e) =>
              e.end === null ? { ...e, end: nowIso } : e
            );
            return { ...t, completed: true, timeEntries: entries };
          }
          if (column === "inprogress") {
            const alreadyRunning = t.timeEntries.some((e) => e.end === null);
            const entries = alreadyRunning
              ? t.timeEntries
              : [...t.timeEntries, { start: nowIso, end: null }];
            return { ...t, completed: false, timeEntries: entries };
          }
          // todo
          const entries = t.timeEntries.map((e) =>
            e.end === null ? { ...e, end: nowIso } : e
          );
          return { ...t, completed: false, timeEntries: entries };
        }),
      }));
    },
    [update]
  );

  // ---- Integrations ----
  const setIntegrations = useCallback(
    (configs: IntegrationConfig[], tasks: Task[]) => {
      update((d) => ({
        ...d,
        integrations: configs,
        tasks,
      }));
    },
    [update]
  );

  if (!loaded) return null;

  return (
    <AppContext.Provider
      value={{
        data,
        addClient,
        renameClient,
        deleteClient,
        addProject,
        renameProject,
        deleteProject,
        addTask,
        updateTask,
        deleteTask,
        toggleComplete,
        startTimer,
        stopTimer,
        deleteTimeEntry,
        addManualTimeEntry,
        updateTimeEntry,
        moveTaskToColumn,
        setIntegrations,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppData(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be inside AppDataProvider");
  return ctx;
}
