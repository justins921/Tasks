"use client";

import { useState, useEffect } from "react";
import { useAppData } from "@/hooks/useAppData";
import { toLocalDatetime } from "@/lib/utils";
import Modal from "./Modal";

// ==================== ADD TASK ====================
export function AddTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { addTask, data } = useAppData();
  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");

  const filteredProjects = clientId
    ? data.projects.filter((p) => p.clientId === clientId)
    : data.projects;

  useEffect(() => {
    if (open) {
      setName("");
      setClientId("");
      setProjectId("");
      setNotes("");
    }
  }, [open]);

  const handleSubmit = () => {
    if (!name.trim()) return;
    addTask({ name: name.trim(), clientId, projectId, notes: notes.trim() });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Task">
      <div className="space-y-3.5">
        <Field label="Task Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="What needs to be done?"
            className="input"
            autoFocus
          />
        </Field>
        <div className="flex gap-2.5">
          <Field label="Client">
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
              }}
              className="input"
            >
              <option value="">-- Select client --</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input"
            >
              <option value="">-- Select project --</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional details..."
            className="input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-outline">
          Cancel
        </button>
        <button onClick={handleSubmit} className="btn-primary">
          Create Task
        </button>
      </div>
    </Modal>
  );
}

// ==================== EDIT TASK ====================
export function EditTaskModal({
  open,
  onClose,
  taskId,
}: {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
}) {
  const { updateTask, data } = useAppData();
  const task = data.tasks.find((t) => t.id === taskId);

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (task && open) {
      setName(task.name);
      setClientId(task.clientId);
      setProjectId(task.projectId);
      setNotes(task.notes);
    }
  }, [task, open]);

  const filteredProjects = clientId
    ? data.projects.filter((p) => p.clientId === clientId)
    : data.projects;

  const handleSave = () => {
    if (!name.trim() || !taskId) return;
    updateTask(taskId, {
      name: name.trim(),
      clientId,
      projectId,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Task">
      <div className="space-y-3.5">
        <Field label="Task Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </Field>
        <div className="flex gap-2.5">
          <Field label="Client">
            <select
              value={clientId}
              onChange={(e) => {
                setClientId(e.target.value);
                setProjectId("");
              }}
              className="input"
            >
              <option value="">-- Select client --</option>
              {data.clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Project">
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="input"
            >
              <option value="">-- Select project --</option>
              {filteredProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Notes">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-outline">
          Cancel
        </button>
        <button onClick={handleSave} className="btn-primary">
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ==================== EDIT TIME ENTRY ====================
export function EditTimeModal({
  open,
  onClose,
  taskId,
  entryIdx,
}: {
  open: boolean;
  onClose: () => void;
  taskId: string | null;
  entryIdx: number | null;
}) {
  const { updateTimeEntry, data } = useAppData();
  const task = data.tasks.find((t) => t.id === taskId);
  const entry =
    task && entryIdx !== null ? task.timeEntries[entryIdx] : null;

  const [startVal, setStartVal] = useState("");
  const [endVal, setEndVal] = useState("");

  useEffect(() => {
    if (entry && open) {
      setStartVal(toLocalDatetime(entry.start));
      setEndVal(entry.end ? toLocalDatetime(entry.end) : "");
    }
  }, [entry, open]);

  const handleSave = () => {
    if (!startVal || !taskId || entryIdx === null) return;
    updateTimeEntry(
      taskId,
      entryIdx,
      new Date(startVal).toISOString(),
      endVal ? new Date(endVal).toISOString() : null
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Time Entry">
      <div className="space-y-3.5">
        <Field label="Start Time">
          <input
            type="datetime-local"
            value={startVal}
            onChange={(e) => setStartVal(e.target.value)}
            step="1"
            className="input"
          />
        </Field>
        <Field label="End Time (leave blank if still running)">
          <input
            type="datetime-local"
            value={endVal}
            onChange={(e) => setEndVal(e.target.value)}
            step="1"
            className="input"
          />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
        <button onClick={onClose} className="btn-outline">
          Cancel
        </button>
        <button onClick={handleSave} className="btn-primary">
          Save Changes
        </button>
      </div>
    </Modal>
  );
}

// ==================== SHARED FIELD ====================
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <label className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
