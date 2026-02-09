import { AppData, ExternalTask, IntegrationConfig, Task, SyncMeta } from "@/lib/types";
import { adapters } from "./index";
import { genId } from "@/lib/utils";

export interface SyncResult {
  imported: number;
  updated: number;
  pushed: number;
  errors: string[];
}

/**
 * Sync tasks between KISS and an external service.
 *
 * Strategy:
 *  1. Fetch all tasks from the external service
 *  2. For each external task:
 *     a. If we already have it (matched by syncMeta.externalId) -> update name/status if changed externally
 *     b. If it's new -> import it as a KISS task
 *  3. For each KISS task linked to this provider:
 *     a. If its completed status differs from external -> push our status back
 *
 * KISS is the source of truth for time tracking. External services
 * are the source of truth for task creation/naming. Status syncs
 * bidirectionally with KISS winning on conflicts.
 */
export async function syncIntegration(
  config: IntegrationConfig,
  data: AppData
): Promise<{ updatedData: AppData; result: SyncResult }> {
  const adapter = adapters[config.provider];
  const result: SyncResult = { imported: 0, updated: 0, pushed: 0, errors: [] };

  let externalTasks: ExternalTask[];
  try {
    externalTasks = await adapter.fetchTasks(config);
  } catch (err: unknown) {
    result.errors.push(`Failed to fetch tasks: ${(err as Error).message}`);
    return { updatedData: data, result };
  }

  const tasks = [...data.tasks];

  // Index existing KISS tasks by their external ID for this provider
  const kissTaskByExternalId = new Map<string, number>();
  tasks.forEach((t, idx) => {
    const meta = t.syncMeta?.find((m) => m.provider === config.provider);
    if (meta) kissTaskByExternalId.set(meta.externalId, idx);
  });

  // Process each external task
  for (const ext of externalTasks) {
    if (!config.syncSettings.importCompleted && ext.completed) continue;

    const existingIdx = kissTaskByExternalId.get(ext.externalId);

    if (existingIdx !== undefined) {
      // Already linked — update name if it changed externally
      const existing = tasks[existingIdx];
      let changed = false;

      if (existing.name !== ext.name) {
        tasks[existingIdx] = { ...existing, name: ext.name };
        changed = true;
      }

      // Update sync timestamp
      if (changed) {
        tasks[existingIdx] = {
          ...tasks[existingIdx],
          syncMeta: tasks[existingIdx].syncMeta?.map((m) =>
            m.provider === config.provider
              ? { ...m, lastSynced: new Date().toISOString() }
              : m
          ),
        };
        result.updated++;
      }
    } else {
      // New task — import it
      const newTask: Task = {
        id: genId(),
        name: ext.name,
        clientId: config.syncSettings.defaultClientId || "",
        projectId: config.syncSettings.defaultProjectId || "",
        notes: ext.description,
        completed: ext.completed,
        timeEntries: [],
        createdAt: new Date().toISOString(),
        syncMeta: [
          {
            provider: config.provider,
            externalId: ext.externalId,
            lastSynced: new Date().toISOString(),
          },
        ],
      };
      tasks.push(newTask);
      result.imported++;
    }
  }

  // Push KISS status back to external service for linked tasks
  const externalIdSet = new Set(externalTasks.map((e) => e.externalId));

  for (const task of tasks) {
    const meta = task.syncMeta?.find((m) => m.provider === config.provider);
    if (!meta || !externalIdSet.has(meta.externalId)) continue;

    const ext = externalTasks.find((e) => e.externalId === meta.externalId);
    if (!ext) continue;

    // If KISS status differs from external, push KISS's status
    if (task.completed !== ext.completed) {
      try {
        await adapter.pushStatus(config, meta.externalId, task.completed);
        result.pushed++;
      } catch (err: unknown) {
        result.errors.push(
          `Failed to push status for "${task.name}": ${(err as Error).message}`
        );
      }
    }
  }

  return {
    updatedData: { ...data, tasks },
    result,
  };
}
