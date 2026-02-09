"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { MenuIcon, FolderIcon } from "./Icons";

interface Props {
  onMenuToggle: () => void;
}

export default function ProjectsSection({ onMenuToggle }: Props) {
  const { data, addProject, renameProject, deleteProject } = useAppData();
  const [clientId, setClientId] = useState("");
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!clientId) return alert("Please select a client.");
    if (!name.trim()) return;
    addProject(clientId, name.trim());
    setName("");
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 md:px-7 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="md:hidden border border-gray-200 rounded-md p-1.5 text-gray-600">
            <MenuIcon />
          </button>
          <span className="text-[17px] font-semibold">Projects</span>
        </div>
      </div>

      <div className="p-4 md:p-7 max-w-[1200px]">
        {/* Add form */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-5">
          <h2 className="text-[15px] font-semibold mb-4">Add Project</h2>
          <div className="flex gap-2.5 flex-col sm:flex-row">
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="input"
              >
                <option value="">-- Select client --</option>
                {data.clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1 block">
                Project Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                placeholder="e.g. Website Redesign"
                className="input"
              />
            </div>
            <button onClick={handleAdd} className="btn-primary self-end">
              Add
            </button>
          </div>
        </div>

        {/* List */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
          <h2 className="text-[15px] font-semibold mb-4">All Projects</h2>
          {data.projects.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <FolderIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No projects yet</p>
            </div>
          ) : (
            <ul>
              {data.projects.map((p) => {
                const client = data.clients.find((c) => c.id === p.clientId);
                const taskCount = data.tasks.filter((t) => t.projectId === p.id).length;
                return (
                  <li
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition mb-0.5"
                  >
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-semibold">
                          {client?.name ?? "?"}
                        </span>
                        &middot; {taskCount} task{taskCount !== 1 ? "s" : ""}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          const n = prompt("Rename project:", p.name);
                          if (n?.trim()) renameProject(p.id, n.trim());
                        }}
                        className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Delete this project?")) deleteProject(p.id);
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
