"use client";

import { DragEvent, useState } from "react";
import { Task } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { useTick } from "@/hooks/useTick";
import { isRunning, getTotalSeconds, formatDuration } from "@/lib/utils";
import { PlayIcon, StopIcon } from "./Icons";

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
}

type Column = "todo" | "inprogress" | "done";

const COLUMNS: { key: Column; title: string; colorClass: string; borderClass: string }[] = [
  { key: "todo", title: "To Do", colorClass: "text-blue-500", borderClass: "border-b-blue-500" },
  { key: "inprogress", title: "In Progress", colorClass: "text-amber-600", borderClass: "border-b-amber-500" },
  { key: "done", title: "Done", colorClass: "text-emerald-500", borderClass: "border-b-emerald-500" },
];

export default function KanbanBoard({ tasks, onEdit }: KanbanBoardProps) {
  const { startTimer, stopTimer, moveTaskToColumn, data } = useAppData();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<Column | null>(null);
  useTick(1000);

  const buckets: Record<Column, Task[]> = {
    todo: tasks.filter((t) => !t.completed && !isRunning(t) && getTotalSeconds(t) === 0),
    inprogress: tasks.filter((t) => !t.completed && (isRunning(t) || getTotalSeconds(t) > 0)),
    done: tasks.filter((t) => t.completed),
  };

  const handleDragStart = (e: DragEvent, taskId: string) => {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: DragEvent, col: Column) => {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedId) {
      moveTaskToColumn(draggedId, col);
      setDraggedId(null);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-5 min-h-[calc(100vh-160px)] items-start flex-col md:flex-row">
      {COLUMNS.map(({ key, title, colorClass, borderClass }) => (
        <div key={key} className="flex-1 min-w-[280px] max-w-[400px] w-full md:w-auto bg-gray-50/80 rounded-xl flex flex-col">
          <div className={`px-4 py-3.5 border-b-2 ${borderClass} flex items-center justify-between`}>
            <h3 className={`text-xs font-bold uppercase tracking-wide flex items-center gap-2 ${colorClass}`}>
              {title}
              <span className="bg-white border border-gray-200 text-gray-500 text-[11px] font-semibold px-2 h-5 leading-5 rounded-full">
                {buckets[key].length}
              </span>
            </h3>
          </div>
          <div
            className={`p-2.5 flex-1 min-h-[100px] transition-colors rounded-b-xl ${
              dragOverCol === key ? "bg-indigo-50/60" : ""
            }`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDragOverCol(key);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, key)}
          >
            {buckets[key].length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-400">No tasks</div>
            ) : (
              buckets[key].map((task) => {
                const running = isRunning(task);
                const totalSec = getTotalSeconds(task);
                const client = data.clients.find((c) => c.id === task.clientId);
                const project = data.projects.find((p) => p.id === task.projectId);

                return (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={() => setDraggedId(null)}
                    className={`
                      bg-white border border-gray-200 rounded-lg p-3 mb-2 cursor-grab
                      active:cursor-grabbing shadow-sm hover:shadow-md hover:border-gray-300 transition-all
                      ${draggedId === task.id ? "opacity-50 rotate-1" : ""}
                    `}
                  >
                    <div className="text-[13px] font-semibold mb-1.5 break-words">{task.name}</div>
                    <div className="flex gap-1 flex-wrap mb-2">
                      {client && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800">
                          {client.name}
                        </span>
                      )}
                      {project && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                          {project.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          running ? "text-emerald-500" : "text-gray-400"
                        }`}
                      >
                        {formatDuration(totalSec)}
                      </span>
                      <div className="flex items-center gap-1">
                        {!task.completed &&
                          (running ? (
                            <button
                              onClick={() => stopTimer(task.id)}
                              className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition"
                            >
                              <StopIcon className="w-3 h-3" />
                            </button>
                          ) : (
                            <button
                              onClick={() => startTimer(task.id)}
                              className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition"
                            >
                              <PlayIcon className="w-3 h-3" />
                            </button>
                          ))}
                        <button
                          onClick={() => onEdit(task.id)}
                          className="text-[11px] text-gray-400 hover:text-gray-700 px-1.5 py-1 transition"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
