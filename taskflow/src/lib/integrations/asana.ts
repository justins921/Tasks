import { ExternalTask, IntegrationConfig } from "@/lib/types";
import { IntegrationAdapter, CredentialField } from "./adapter";

async function proxyFetch(url: string, config: IntegrationConfig, method = "GET", body?: unknown) {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "asana", url, method, body, credentials: config.credentials }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Asana API error: ${res.status}`);
  }
  return res.json();
}

export const asanaAdapter: IntegrationAdapter = {
  displayName: "Asana",

  credentialFields: [
    {
      key: "accessToken",
      label: "Personal Access Token",
      placeholder: "1/12345...",
      helpUrl: "https://app.asana.com/0/developer-console",
      secret: true,
    },
  ] as CredentialField[],

  async testConnection(config) {
    try {
      await proxyFetch("https://app.asana.com/api/1.0/users/me", config);
      return true;
    } catch (e: unknown) {
      return (e as Error).message || "Connection failed";
    }
  },

  async listBoards(config) {
    // Asana hierarchy: Workspace > Project — we sync at the Project level
    const res = await proxyFetch(
      "https://app.asana.com/api/1.0/projects?opt_fields=name,workspace.name&limit=100",
      config
    );
    return (res.data || []).map(
      (p: { gid: string; name: string; workspace?: { name: string } }) => ({
        id: p.gid,
        name: p.workspace ? `${p.workspace.name} / ${p.name}` : p.name,
      })
    );
  },

  async fetchTasks(config) {
    const projectId = config.syncSettings.boardOrProjectId;
    if (!projectId) throw new Error("No project selected");

    const res = await proxyFetch(
      `https://app.asana.com/api/1.0/projects/${projectId}/tasks?opt_fields=name,notes,completed,memberships.section.name&limit=100`,
      config
    );

    return (res.data || []).map(
      (t: {
        gid: string;
        name: string;
        notes: string;
        completed: boolean;
        memberships?: { section?: { name: string } }[];
      }): ExternalTask => ({
        externalId: t.gid,
        name: t.name,
        completed: t.completed,
        description: t.notes || "",
        listOrStatus:
          t.memberships?.[0]?.section?.name || "No Section",
      })
    );
  },

  async pushStatus(config, externalId, completed) {
    await proxyFetch(
      `https://app.asana.com/api/1.0/tasks/${externalId}`,
      config,
      "PUT",
      { data: { completed } }
    );
  },
};
