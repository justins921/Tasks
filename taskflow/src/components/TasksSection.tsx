"use client";

import { useState } from "react";
import { ViewMode } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { isRunning } from "@/lib/utils";
import TaskCard from "./TaskCard";
import KanbanBoard from "./KanbanBoard";
import { AddTaskModal, EditTaskModal, EditTimeModal } from "./TaskModals";
import { MenuIcon, PlusIcon, ListIcon, BoardIcon, CheckSquareIcon } from "./Icons";

interface Props {
  onMenuToggle: () => void;
}

export default function TasksSection({ onMenuToggle }: Props) {
  const { data } = useAppData();
  const [view, setView] = useState<ViewMode>("list");
  const [filterClient, setFilterClient] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [showCompleted, setShowCompleted] = useState(false);

  // Modals
  const [addOpen, setAddOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTimeTaskId, setEditTimeTaskId] = useState<string | null>(null);
  const [editTimeIdx, setEditTimeIdx] = useState<number | null>(null);

  // Filter tasks
  let tasks = [...data.tasks];
  if (filterClient) tasks = tasks.filter((t) => t.clientId === filterClient);
  if (filterProject) tasks = tasks.filter((t) => t.projectId === filterProject);
  if (!showCompleted) tasks = tasks.filter((t) => !t.completed);

  // Sort for list view
  const sortedTasks = [...tasks].sort((a, b) => {
    const ar = isRunning(a) ? 1 : 0;
    const br = isRunning(b) ? 1 : 0;
    if (ar !== br) return br - ar;
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <>
      {/* Top bar */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-7 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="md:hidden border border-gray-200 rounded-md p-1.5 text-gray-600"
          >
            <MenuIcon />
          </button>
          <span className="text-[17px] font-semibold">Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ListIcon />
              <span className="hidden sm:inline">List</span>
            </button>
            <button
              onClick={() => setView("board")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                view === "board"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BoardIcon />
              <span className="hidden sm:inline">Board</span>
            </button>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="btn-primary text-xs flex items-center gap-1.5"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 md:p-7 max-w-[1200px]">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-5 flex-wrap">
          <select
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5"
          >
            <option value="">All clients</option>
            {data.clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="text-xs border border-gray-200 rounded-md px-2.5 py-1.5"
          >
            <option value="">All projects</option>
            {data.projects.map((p) => {
              const cl = data.clients.find((c) => c.id === p.clientId);
              return (
                <option key={p.id} value={p.id}>
                  {cl ? `${cl.name} / ` : ""}{p.name}
                </option>
              );
            })}
          </select>
          <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
            <input
              type="checkbox"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            Show completed
          </label>
        </div>

        {view === "list" ? (
          sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckSquareIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No tasks to show</p>
              <p className="text-xs mt-1">Create one with the &quot;Add Task&quot; button above</p>
            </div>
          ) : (
            sortedTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={setEditTaskId}
                onEditTime={(tid, idx) => {
                  setEditTimeTaskId(tid);
                  setEditTimeIdx(idx);
                }}
              />
            ))
          )
        ) : (
          <KanbanBoard tasks={tasks} onEdit={setEditTaskId} />
        )}
      </div>

      {/* Modals */}
      <AddTaskModal open={addOpen} onClose={() => setAddOpen(false)} />
      <EditTaskModal
        open={!!editTaskId}
        onClose={() => setEditTaskId(null)}
        taskId={editTaskId}
      />
      <EditTimeModal
        open={editTimeTaskId !== null && editTimeIdx !== null}
        onClose={() => {
          setEditTimeTaskId(null);
          setEditTimeIdx(null);
        }}
        taskId={editTimeTaskId}
        entryIdx={editTimeIdx}
      />
    </>
  );
}
