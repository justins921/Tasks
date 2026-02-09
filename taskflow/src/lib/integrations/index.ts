import { IntegrationProvider } from "@/lib/types";
import { IntegrationAdapter } from "./adapter";
import { trelloAdapter } from "./trello";
import { clickupAdapter } from "./clickup";
import { asanaAdapter } from "./asana";
import { mondayAdapter } from "./monday";

export const adapters: Record<IntegrationProvider, IntegrationAdapter> = {
  trello: trelloAdapter,
  clickup: clickupAdapter,
  asana: asanaAdapter,
  monday: mondayAdapter,
};

export const PROVIDER_LIST: { key: IntegrationProvider; name: string; color: string }[] = [
  { key: "trello", name: "Trello", color: "#0079BF" },
  { key: "clickup", name: "ClickUp", color: "#7B68EE" },
  { key: "asana", name: "Asana", color: "#F06A6A" },
  { key: "monday", name: "Monday.com", color: "#FF3D57" },
];

export { type IntegrationAdapter, type CredentialField } from "./adapter";
