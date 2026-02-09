import { Task, TimeEntry } from "./types";

export function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function isRunning(task: Task): boolean {
  return task.timeEntries.some((e) => e.end === null);
}

export function getTotalSeconds(task: Task): number {
  let total = 0;
  const now = new Date();
  for (const e of task.timeEntries) {
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : now;
    total += (end.getTime() - start.getTime()) / 1000;
  }
  return Math.max(0, Math.floor(total));
}

export function getEntrySeconds(entry: TimeEntry): number {
  const start = new Date(entry.start);
  const end = entry.end ? new Date(entry.end) : new Date();
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
}

export function formatDuration(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function formatDurationShort(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${totalSeconds}s`;
}

export function formatHours(seconds: number): string {
  return (seconds / 3600).toFixed(1);
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function fmtTime(d: Date): string {
  return d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toLocalDatetime(isoStr: string): string {
  const d = new Date(isoStr);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 19);
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function getSecondsInMonth(
  task: Task,
  year: number,
  month: number
): number {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1);
  const now = new Date();
  let total = 0;

  for (const e of task.timeEntries) {
    const start = new Date(e.start);
    const end = e.end ? new Date(e.end) : now;
    const clampStart = start < monthStart ? monthStart : start;
    const clampEnd = end > monthEnd ? monthEnd : end;
    if (clampStart < clampEnd) {
      total += (clampEnd.getTime() - clampStart.getTime()) / 1000;
    }
  }

  return Math.max(0, Math.floor(total));
}
