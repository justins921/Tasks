import { ExternalTask, IntegrationConfig } from "@/lib/types";
import { IntegrationAdapter, CredentialField } from "./adapter";

async function proxyFetch(url: string, config: IntegrationConfig, method = "POST", body?: unknown) {
  const res = await fetch("/api/integrations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider: "monday", url, method, body, credentials: config.credentials }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Monday.com API error: ${res.status}`);
  }
  return res.json();
}

// Monday.com uses GraphQL
function gql(query: string, config: IntegrationConfig) {
  return proxyFetch(
    "https://api.monday.com/v2",
    config,
    "POST",
    { query }
  );
}

export const mondayAdapter: IntegrationAdapter = {
  displayName: "Monday.com",

  credentialFields: [
    {
      key: "apiToken",
      label: "API Token (v2)",
      placeholder: "eyJhb...",
      helpUrl: "https://monday.com/developers/apps",
      secret: true,
    },
  ] as CredentialField[],

  async testConnection(config) {
    try {
      const res = await gql("{ me { id name } }", config);
      if (res.data?.me?.id) return true;
      return "Could not verify identity";
    } catch (e: unknown) {
      return (e as Error).message || "Connection failed";
    }
  },

  async listBoards(config) {
    const res = await gql(
      `{ boards(limit: 100) { id name } }`,
      config
    );
    return (res.data?.boards || []).map(
      (b: { id: string; name: string }) => ({
        id: b.id,
        name: b.name,
      })
    );
  },

  async fetchTasks(config) {
    const boardId = config.syncSettings.boardOrProjectId;
    if (!boardId) throw new Error("No board selected");

    const res = await gql(
      `{
        boards(ids: [${boardId}]) {
          items_page(limit: 200) {
            items {
              id
              name
              group { title }
              column_values { id text }
            }
          }
        }
      }`,
      config
    );

    const items = res.data?.boards?.[0]?.items_page?.items || [];

    return items.map(
      (item: {
        id: string;
        name: string;
        group?: { title: string };
        column_values?: { id: string; text: string }[];
      }): ExternalTask => {
        // Monday uses a "status" column — look for it
        const statusCol = item.column_values?.find(
          (c) => c.id === "status" || c.id === "status_1"
        );
        const statusText = statusCol?.text || "";
        const isDone = /done|complete|closed/i.test(statusText);

        return {
          externalId: item.id,
          name: item.name,
          completed: isDone,
          description: "",
          listOrStatus: item.group?.title || statusText || "Unknown",
        };
      }
    );
  },

  async pushStatus(config, externalId, completed) {
    // Update the status column — this assumes a standard status column
    const label = completed ? "Done" : "Working on it";
    await gql(
      `mutation {
        change_simple_column_value(
          item_id: ${externalId},
          board_id: ${config.syncSettings.boardOrProjectId},
          column_id: "status",
          value: "${label}"
        ) { id }
      }`,
      config
    );
  },
};
