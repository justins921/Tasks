"use client";

import { useState } from "react";
import { Task } from "@/lib/types";
import { useAppData } from "@/hooks/useAppData";
import { useTick } from "@/hooks/useTick";
import {
  isRunning,
  getTotalSeconds,
  formatDuration,
  formatDurationShort,
  fmtDate,
  fmtTime,
  getEntrySeconds,
} from "@/lib/utils";
import { PlayIcon, StopIcon, ClockIcon } from "./Icons";

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onEditTime: (taskId: string, idx: number) => void;
}

export default function TaskCard({ task, onEdit, onEditTime }: TaskCardProps) {
  const { toggleComplete, startTimer, stopTimer, deleteTask, deleteTimeEntry, addManualTimeEntry, data } =
    useAppData();
  const [showEntries, setShowEntries] = useState(false);
  useTick(isRunning(task) ? 1000 : 0);

  const running = isRunning(task);
  const totalSec = getTotalSeconds(task);
  const client = data.clients.find((c) => c.id === task.clientId);
  const project = data.projects.find((p) => p.id === task.projectId);

  return (
    <div
      className={`
        border rounded-xl p-4 mb-2.5 bg-white transition-all duration-200 hover:shadow-md hover:border-gray-300
        ${running ? "border-l-[3px] border-l-emerald-500" : "border-gray-200"}
        ${task.completed ? "opacity-55" : ""}
      `}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 flex-wrap md:flex-nowrap">
        <input
          type="checkbox"
          checked={task.completed}
          onChange={() => toggleComplete(task.id)}
          className="
            w-5 h-5 mt-0.5 rounded-md border-2 border-gray-300 appearance-none cursor-pointer flex-shrink-0
            checked:bg-indigo-600 checked:border-indigo-600 transition-all
            hover:border-indigo-500
            relative
            after:content-[''] after:absolute after:left-[5px] after:top-[1px] after:w-[5px] after:h-[9px]
            after:border-white after:border-r-2 after:border-b-2 after:rotate-45
            after:opacity-0 checked:after:opacity-100
          "
        />
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm mb-1 ${task.completed ? "line-through" : ""}`}>
            {task.name}
          </div>
          <div className="flex gap-1.5 flex-wrap mb-1">
            {client && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                {client.name}
              </span>
            )}
            {project && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                {project.name}
              </span>
            )}
            {running && (
              <span className="inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 animate-pulse">
                Recording
              </span>
            )}
          </div>
          {task.notes && (
            <div className="text-[13px] text-gray-500 mt-1 line-clamp-2">{task.notes}</div>
          )}
        </div>

        {/* Timer area */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto w-full md:w-auto justify-end mt-2 md:mt-0">
          <span
            className={`
              font-mono text-lg font-semibold tracking-tight min-w-[80px] text-right
              ${running ? "text-emerald-500" : "text-gray-400"}
            `}
          >
            {formatDuration(totalSec)}
          </span>
          {!task.completed &&
            (running ? (
              <button
                onClick={() => stopTimer(task.id)}
                className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md shadow-red-500/30 hover:bg-red-600 hover:scale-105 transition-all"
                title="Stop"
              >
                <StopIcon />
              </button>
            ) : (
              <button
                onClick={() => startTimer(task.id)}
                className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-105 transition-all"
                title="Start"
              >
                <PlayIcon />
              </button>
            ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-100">
        <div>
          {task.timeEntries.length > 0 && (
            <>
              <button
                onClick={() => setShowEntries(!showEntries)}
                className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition"
              >
                <ClockIcon />
                {task.timeEntries.length} entr{task.timeEntries.length === 1 ? "y" : "ies"} &middot;{" "}
                {formatDurationShort(totalSec)}
              </button>

              {showEntries && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  {task.timeEntries.map((e, idx) => {
                    const s = new Date(e.start);
                    const en = e.end ? new Date(e.end) : null;
                    const dur = getEntrySeconds(e);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 py-1.5 px-2 text-xs rounded hover:bg-white transition"
                      >
                        <span className="text-gray-500 min-w-[60px]">{fmtDate(s)}</span>
                        <span className="flex-1 text-gray-700">
                          {fmtTime(s)} &ndash;{" "}
                          {en ? (
                            fmtTime(en)
                          ) : (
                            <span className="text-emerald-500">running</span>
                          )}
                        </span>
                        <span className="font-mono text-gray-500 min-w-[55px] text-right">
                          {formatDuration(dur)}
                        </span>
                        <button
                          onClick={() => onEditTime(task.id, idx)}
                          className="text-gray-400 hover:text-gray-700 transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this time entry?")) deleteTimeEntry(task.id, idx);
                          }}
                          className="text-red-400 hover:text-red-600 transition"
                        >
                          Del
                        </button>
                      </div>
                    );
                  })}
                  <button
                    onClick={() => addManualTimeEntry(task.id)}
                    className="mt-2 text-xs border border-gray-200 rounded px-2 py-1 text-gray-500 hover:bg-white transition"
                  >
                    + Add manual entry
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => onEdit(task.id)}
            className="text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-50 transition"
          >
            Edit
          </button>
          <button
            onClick={() => {
              if (confirm("Delete this task and all its time entries?")) deleteTask(task.id);
            }}
            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-gray-50 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
