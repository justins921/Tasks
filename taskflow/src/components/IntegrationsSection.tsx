"use client";

import { useState, useCallback } from "react";
import { IntegrationConfig, IntegrationProvider } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { adapters, PROVIDER_LIST } from "@/lib/integrations";
import { syncIntegration, SyncResult } from "@/lib/integrations/sync";
import Modal from "./Modal";
import { MenuIcon } from "./Icons";

interface Props {
  onMenuToggle: () => void;
}

export default function IntegrationsSection({ onMenuToggle }: Props) {
  const { data, setIntegrations } = useAppData();
  const configs = data.integrations || [];

  const [setupProvider, setSetupProvider] = useState<IntegrationProvider | null>(null);
  const [syncing, setSyncing] = useState<IntegrationProvider | null>(null);
  const [lastResult, setLastResult] = useState<{ provider: IntegrationProvider; result: SyncResult } | null>(null);

  const getConfig = (p: IntegrationProvider) => configs.find((c) => c.provider === p);

  const handleSync = useCallback(
    async (provider: IntegrationProvider) => {
      const config = getConfig(provider);
      if (!config || !config.enabled) return;

      setSyncing(provider);
      setLastResult(null);
      try {
        const { updatedData, result } = await syncIntegration(config, data);
        // Update tasks from sync and mark lastSynced
        const updatedConfigs = (updatedData.integrations || configs).map((c) =>
          c.provider === provider ? { ...c, lastSynced: new Date().toISOString() } : c
        );
        setIntegrations(updatedConfigs, updatedData.tasks);
        setLastResult({ provider, result });
      } catch (err: unknown) {
        setLastResult({
          provider,
          result: { imported: 0, updated: 0, pushed: 0, errors: [(err as Error).message] },
        });
      } finally {
        setSyncing(null);
      }
    },
    [data, configs, setIntegrations]
  );

  const removeIntegration = (provider: IntegrationProvider) => {
    if (!confirm(`Remove ${provider} integration? Tasks already imported will remain.`)) return;
    setIntegrations(
      configs.filter((c) => c.provider !== provider),
      data.tasks
    );
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 md:px-7 py-3.5 flex items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="md:hidden border border-gray-200 rounded-md p-1.5 text-gray-600">
            <MenuIcon />
          </button>
          <span className="text-[17px] font-semibold">Integrations</span>
        </div>
      </div>

      <div className="p-4 md:p-7 max-w-[1200px]">
        <p className="text-sm text-gray-500 mb-6">
          Connect external task managers to sync tasks into KISS as your single source of truth.
          Time tracking stays in KISS; task status syncs both ways.
        </p>

        {/* Provider cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
          {PROVIDER_LIST.map(({ key, name, color }) => {
            const config = getConfig(key);
            const isConnected = config?.enabled;
            const isSyncing = syncing === key;

            return (
              <div
                key={key}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                      style={{ background: color }}
                    >
                      {name[0]}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{name}</div>
                      <div className="text-xs text-gray-400">
                        {isConnected
                          ? config?.lastSynced
                            ? `Last synced ${new Date(config.lastSynced).toLocaleString()}`
                            : "Connected - never synced"
                          : "Not connected"}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-emerald-400" : "bg-gray-300"}`}
                  />
                </div>

                {/* Sync result banner */}
                {lastResult?.provider === key && (
                  <div className={`text-xs p-2.5 rounded-lg mb-3 ${lastResult.result.errors.length > 0 ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {lastResult.result.errors.length > 0 ? (
                      <>{lastResult.result.errors.join(". ")}</>
                    ) : (
                      <>
                        Imported {lastResult.result.imported}, updated {lastResult.result.updated}, pushed {lastResult.result.pushed} status changes
                      </>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {isConnected ? (
                    <>
                      <button
                        onClick={() => handleSync(key)}
                        disabled={isSyncing}
                        className="btn-primary text-xs flex-1 justify-center disabled:opacity-50"
                      >
                        {isSyncing ? "Syncing..." : "Sync Now"}
                      </button>
                      <button
                        onClick={() => setSetupProvider(key)}
                        className="btn-outline text-xs"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => removeIntegration(key)}
                        className="text-xs text-red-400 hover:text-red-600 px-2 transition"
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setSetupProvider(key)}
                      className="btn-primary text-xs flex-1 justify-center"
                    >
                      Connect
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* How it works */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h3 className="font-semibold text-sm mb-3">How sync works</h3>
          <ul className="text-xs text-gray-500 space-y-1.5 list-disc pl-5">
            <li>Tasks are imported from the external service into KISS with the client/project you choose</li>
            <li>Task names update from the external service (it owns task creation)</li>
            <li>Completion status syncs both ways &mdash; KISS wins on conflicts</li>
            <li>Time tracking is KISS-only and never pushed externally</li>
            <li>Already-imported tasks are matched by ID so duplicates won&apos;t happen</li>
          </ul>
        </div>
      </div>

      {/* Setup modal */}
      {setupProvider && (
        <SetupModal
          provider={setupProvider}
          existingConfig={getConfig(setupProvider) || null}
          onClose={() => setSetupProvider(null)}
          onSave={(config) => {
            const updated = configs.filter((c) => c.provider !== setupProvider);
            updated.push(config);
            setIntegrations(updated, data.tasks);
            setSetupProvider(null);
          }}
        />
      )}
    </>
  );
}

// ============================================================
// SETUP MODAL
// ============================================================

function SetupModal({
  provider,
  existingConfig,
  onClose,
  onSave,
}: {
  provider: IntegrationProvider;
  existingConfig: IntegrationConfig | null;
  onClose: () => void;
  onSave: (config: IntegrationConfig) => void;
}) {
  const { data } = useAppData();
  const adapter = adapters[provider];

  const [credentials, setCredentials] = useState<Record<string, string>>(
    existingConfig?.credentials || {}
  );
  const [boardId, setBoardId] = useState(existingConfig?.syncSettings.boardOrProjectId || "");
  const [defaultClientId, setDefaultClientId] = useState(existingConfig?.syncSettings.defaultClientId || "");
  const [defaultProjectId, setDefaultProjectId] = useState(existingConfig?.syncSettings.defaultProjectId || "");
  const [importCompleted, setImportCompleted] = useState(existingConfig?.syncSettings.importCompleted ?? false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [boards, setBoards] = useState<{ id: string; name: string }[] | null>(null);
  const [loadingBoards, setLoadingBoards] = useState(false);

  const buildConfig = (): IntegrationConfig => ({
    provider,
    enabled: true,
    credentials,
    syncSettings: {
      importCompleted,
      autoSync: false,
      defaultClientId,
      defaultProjectId,
      boardOrProjectId: boardId,
    },
    lastSynced: existingConfig?.lastSynced || null,
  });

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    const config = buildConfig();
    const result = await adapter.testConnection(config);
    if (result === true) {
      setTestResult("success");
      // Auto-load boards
      setLoadingBoards(true);
      try {
        const b = await adapter.listBoards(config);
        setBoards(b);
      } catch {
        setBoards([]);
      } finally {
        setLoadingBoards(false);
      }
    } else {
      setTestResult(result);
    }
    setTesting(false);
  };

  const handleLoadBoards = async () => {
    setLoadingBoards(true);
    try {
      const b = await adapter.listBoards(buildConfig());
      setBoards(b);
    } catch (e: unknown) {
      alert((e as Error).message);
    } finally {
      setLoadingBoards(false);
    }
  };

  const filteredProjects = defaultClientId
    ? data.projects.filter((p) => p.clientId === defaultClientId)
    : data.projects;

  return (
    <Modal open title={`Connect ${adapter.displayName}`} onClose={onClose}>
      <div className="space-y-4">
        {/* Credentials */}
        {adapter.credentialFields.map((field) => (
          <div key={field.key} className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              {field.label}
              {field.helpUrl && (
                <a
                  href={field.helpUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 text-indigo-500 normal-case font-normal"
                >
                  Get one here
                </a>
              )}
            </label>
            <input
              type={field.secret ? "password" : "text"}
              value={credentials[field.key] || ""}
              onChange={(e) =>
                setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
              placeholder={field.placeholder}
              className="input"
            />
          </div>
        ))}

        {/* Test connection */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleTest}
            disabled={testing}
            className="btn-outline text-xs disabled:opacity-50"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          {testResult === "success" && (
            <span className="text-xs text-emerald-600 font-medium">Connected!</span>
          )}
          {testResult && testResult !== "success" && (
            <span className="text-xs text-red-500">{testResult}</span>
          )}
        </div>

        {/* Board selection */}
        {(boards !== null || existingConfig) && (
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Board / Project to sync
            </label>
            {boards && boards.length > 0 ? (
              <select
                value={boardId}
                onChange={(e) => setBoardId(e.target.value)}
                className="input"
              >
                <option value="">-- Select --</option>
                {boards.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            ) : boards && boards.length === 0 ? (
              <div className="text-xs text-gray-400">No boards found</div>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={boardId}
                  onChange={(e) => setBoardId(e.target.value)}
                  placeholder="Board/project ID"
                  className="input"
                />
                <button onClick={handleLoadBoards} disabled={loadingBoards} className="btn-outline text-xs whitespace-nowrap disabled:opacity-50">
                  {loadingBoards ? "Loading..." : "Load list"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Default client/project for imported tasks */}
        <div className="flex gap-2.5">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Default Client
            </label>
            <select
              value={defaultClientId}
              onChange={(e) => { setDefaultClientId(e.target.value); setDefaultProjectId(""); }}
              className="input"
            >
              <option value="">None</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
              Default Project
            </label>
            <select
              value={defaultProjectId}
              onChange={(e) => setDefaultProjectId(e.target.value)}
              className="input"
            >
              <option value="">None</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
          <input
            type="checkbox"
            checked={importCompleted}
            onChange={(e) => setImportCompleted(e.target.checked)}
            className="w-4 h-4"
          />
          Import completed tasks
        </label>
      </div>

      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-outline">Cancel</button>
        <button
          onClick={() => onSave(buildConfig())}
          disabled={!boardId}
          className="btn-primary disabled:opacity-50"
        >
          Save & Enable
        </button>
      </div>
    </Modal>
  );
}
