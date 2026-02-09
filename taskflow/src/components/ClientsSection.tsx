"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { MenuIcon, UsersIcon } from "./Icons";

interface Props {
  onMenuToggle: () => void;
}

export default function ClientsSection({ onMenuToggle }: Props) {
  const { data, addClient, renameClient, deleteClient } = useAppData();
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    addClient(name.trim());
    setName("");
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 md:px-7 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="md:hidden border border-gray-200 rounded-md p-1.5 text-gray-600">
            <MenuIcon />
          </button>
          <span className="text-[17px] font-semibold">Clients</span>
        </div>
      </div>

      <div className="p-4 md:p-7 max-w-[1200px]">
        {/* Add form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
          <h2 className="text-[15px] font-semibold mb-4">Add Client</h2>
          <div className="flex gap-2.5 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Acme Corp"
                className="input"
              />
            </div>
            <button onClick={handleAdd} className="btn-primary self-end">
              Add Client
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-[15px] font-semibold mb-4">All Clients</h2>
          {data.clients.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <UsersIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No clients yet</p>
            </div>
          ) : (
            <ul>
              {data.clients.map((c) => {
                const projCount = data.projects.filter((p) => p.clientId === c.id).length;
                const taskCount = data.tasks.filter((t) => t.clientId === c.id).length;
                return (
                  <li
                    key={c.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition mb-0.5"
                  >
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        {projCount} project{projCount !== 1 ? "s" : ""} &middot;{" "}
                        {taskCount} task{taskCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const n = prompt("Rename client:", c.name);
                          if (n?.trim()) renameClient(c.id, n.trim());
                        }}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this client?")) deleteClient(c.id);
                        }}
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-100 transition"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
