import { ExternalTask, IntegrationConfig } from "@/lib/types";
import { IntegrationAdapter, CredentialField } from "./adapter";

async function proxyFetch(url: string, config: IntegrationConfig, method = "GET", body?: unknown) {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "clickup", url, method, body, credentials: config.credentials }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `ClickUp API error: ${res.status}`);
  }
  return res.json();
}

export const clickupAdapter: IntegrationAdapter = {
  displayName: "ClickUp",

  credentialFields: [
    {
      key: "apiToken",
      label: "Personal API Token",
      placeholder: "pk_...",
      helpUrl: "https://app.clickup.com/settings/apps",
      secret: true,
    },
  ] as CredentialField[],

  async testConnection(config) {
    try {
      await proxyFetch("https://api.clickup.com/api/v2/user", config);
      return true;
    } catch (e: unknown) {
      return (e as Error).message || "Connection failed";
    }
  },

  async listBoards(config) {
    // ClickUp hierarchy: Workspace > Space > Folder > List
    // We sync at the List level (closest to a "board")
    const teamsRes = await proxyFetch("https://api.clickup.com/api/v2/team", config);
    const teams = teamsRes.teams || [];

    const boards: { id: string; name: string }[] = [];
    for (const team of teams) {
      const spacesRes = await proxyFetch(
        `https://api.clickup.com/api/v2/team/${team.id}/space?archived=false`,
        config
      );
      for (const space of spacesRes.spaces || []) {
        // Folderless lists
        const folderlessRes = await proxyFetch(
          `https://api.clickup.com/api/v2/space/${space.id}/list?archived=false`,
          config
        );
        for (const list of folderlessRes.lists || []) {
          boards.push({ id: list.id, name: `${space.name} / ${list.name}` });
        }
        // Lists inside folders
        const foldersRes = await proxyFetch(
          `https://api.clickup.com/api/v2/space/${space.id}/folder?archived=false`,
          config
        );
        for (const folder of foldersRes.folders || []) {
          for (const list of folder.lists || []) {
            boards.push({ id: list.id, name: `${space.name} / ${folder.name} / ${list.name}` });
          }
        }
      }
    }
    return boards;
  },

  async fetchTasks(config) {
    const listId = config.syncSettings.boardOrProjectId;
    if (!listId) throw new Error("No list selected");

    const res = await proxyFetch(
      `https://api.clickup.com/api/v2/list/${listId}/task?archived=false&include_closed=true`,
      config
    );

    return (res.tasks || []).map(
      (t: { id: string; name: string; description: string; status: { status: string }; date_done: string | null }): ExternalTask => ({
        externalId: t.id,
        name: t.name,
        completed: t.status?.status?.toLowerCase() === "closed" || !!t.date_done,
        description: t.description || "",
        listOrStatus: t.status?.status || "Unknown",
      })
    );
  },

  async pushStatus(config, externalId, completed) {
    await proxyFetch(
      `https://api.clickup.com/api/v2/task/${externalId}`,
      config,
      "PUT",
      { status: completed ? "closed" : "open" }
    );
  },
};
