import { ExternalTask, IntegrationConfig } from "@/lib/types";

/**
 * Every integration adapter implements this interface.
 * Adapters translate between the external service's API and our
 * normalized ExternalTask format.
 */
export interface IntegrationAdapter {
  /** Human-readable service name */
  readonly displayName: string;

  /** Which credential fields this service needs */
  readonly credentialFields: CredentialField[];

  /**
   * Validate that the credentials work by making a test API call.
   * Returns true if valid, or an error message string.
   */
  testConnection(config: IntegrationConfig): Promise<true | string>;

  /**
   * List available boards / projects / workspaces the user can sync with.
   * Shown in the setup UI so they can pick which board to import from.
   */
  listBoards(config: IntegrationConfig): Promise<{ id: string; name: string }[]>;

  /**
   * Fetch all tasks from the configured board/project.
   */
  fetchTasks(config: IntegrationConfig): Promise<ExternalTask[]>;

  /**
   * Push a task's status back to the external service.
   */
  pushStatus(
    config: IntegrationConfig,
    externalId: string,
    completed: boolean
  ): Promise<void>;
}

export interface CredentialField {
  key: string;
  label: string;
  placeholder: string;
  helpUrl?: string; // link to "get your API key" page
  secret?: boolean; // mask input
}
