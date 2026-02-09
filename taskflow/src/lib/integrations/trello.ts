import { ExternalTask, IntegrationConfig } from "@/lib/types";
import { IntegrationAdapter, CredentialField } from "./adapter";

async function proxyFetch(url: string, config: IntegrationConfig, method = "GET", body?: unknown) {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "trello", url, method, body, credentials: config.credentials }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Trello API error: ${res.status}`);
  }
  return res.json();
}

export const trelloAdapter: IntegrationAdapter = {
  displayName: "Trello",

  credentialFields: [
    {
      key: "apiKey",
      label: "API Key",
      placeholder: "Your Trello API key",
      helpUrl: "https://trello.com/power-ups/admin",
    },
    {
      key: "token",
      label: "Token",
      placeholder: "Your Trello token",
      helpUrl: "https://trello.com/power-ups/admin",
      secret: true,
    },
  ] as CredentialField[],

  async testConnection(config) {
    try {
      const { apiKey, token } = config.credentials;
      await proxyFetch(
        `https://api.trello.com/1/members/me?key=${apiKey}&token=${token}`,
        config
      );
      return true;
    } catch (e: unknown) {
      return (e as Error).message || "Connection failed";
    }
  },

  async listBoards(config) {
    const { apiKey, token } = config.credentials;
    const boards = await proxyFetch(
      `https://api.trello.com/1/members/me/boards?key=${apiKey}&token=${token}&fields=name`,
      config
    );
    return boards.map((b: { id: string; name: string }) => ({
      id: b.id,
      name: b.name,
    }));
  },

  async fetchTasks(config) {
    const { apiKey, token } = config.credentials;
    const boardId = config.syncSettings.boardOrProjectId;
    if (!boardId) throw new Error("No board selected");

    // Fetch cards and lists in parallel
    const [cards, lists] = await Promise.all([
      proxyFetch(
        `https://api.trello.com/1/boards/${boardId}/cards?key=${apiKey}&token=${token}&fields=name,desc,closed,idList`,
        config
      ),
      proxyFetch(
        `https://api.trello.com/1/boards/${boardId}/lists?key=${apiKey}&token=${token}&fields=name`,
        config
      ),
    ]);

    const listMap = new Map<string, string>();
    for (const l of lists) listMap.set(l.id, l.name);

    return cards.map((c: { id: string; name: string; desc: string; closed: boolean; idList: string }): ExternalTask => ({
      externalId: c.id,
      name: c.name,
      completed: c.closed,
      description: c.desc || "",
      listOrStatus: listMap.get(c.idList) || "Unknown",
    }));
  },

  async pushStatus(config, externalId, completed) {
    const { apiKey, token } = config.credentials;
    await proxyFetch(
      `https://api.trello.com/1/cards/${externalId}?key=${apiKey}&token=${token}`,
      config,
      "PUT",
      { closed: completed }
    );
  },
};
