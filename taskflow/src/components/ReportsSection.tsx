"use client";

import { useState } from "react";
import { useAppData } from "@/hooks/useAppData";
import { useTick } from "@/hooks/useTick";
import {
  getSecondsInMonth,
  formatHours,
  daysInMonth,
} from "@/lib/utils";
import {
  MenuIcon,
  BarChartIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronRightIcon as ChevronIcon,
} from "./Icons";

interface Props {
  onMenuToggle: () => void;
}

export default function ReportsSection({ onMenuToggle }: Props) {
  const { data } = useAppData();
  useTick(60000); // refresh every minute for running timers

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [expandedClients, setExpandedClients] = useState<Set<string>>(new Set());

  const changeMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m);
    setYear(y);
    setExpandedClients(new Set());
  };

  const monthLabel = new Date(year, month).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
  });

  // Aggregate
  type ProjectBucket = { name: string; seconds: number; tasks: { name: string; seconds: number }[] };
  type ClientBucket = { name: string; seconds: number; projects: Record<string, ProjectBucket> };

  const clientMap: Record<string, ClientBucket> = {};
  let totalSeconds = 0;
  const activeClients = new Set<string>();

  for (const task of data.tasks) {
    const sec = getSecondsInMonth(task, year, month);
    if (sec === 0) continue;
    totalSeconds += sec;

    const clientId = task.clientId || "__none";
    const projectId = task.projectId || "__none";
    const clientName = task.clientId
      ? data.clients.find((c) => c.id === task.clientId)?.name ?? "Unknown"
      : "No Client";
    const projectName = task.projectId
      ? data.projects.find((p) => p.id === task.projectId)?.name ?? "Unknown"
      : "No Project";

    if (!clientMap[clientId]) {
      clientMap[clientId] = { name: clientName, seconds: 0, projects: {} };
    }
    clientMap[clientId].seconds += sec;
    activeClients.add(clientId);

    if (!clientMap[clientId].projects[projectId]) {
      clientMap[clientId].projects[projectId] = { name: projectName, seconds: 0, tasks: [] };
    }
    clientMap[clientId].projects[projectId].seconds += sec;
    clientMap[clientId].projects[projectId].tasks.push({ name: task.name, seconds: sec });
  }

  const sortedClients = Object.entries(clientMap).sort((a, b) => b[1].seconds - a[1].seconds);
  const maxSec = sortedClients.length > 0 ? sortedClients[0][1].seconds : 1;
  const clientCount = [...activeClients].filter((id) => id !== "__none").length;
  const days = daysInMonth(year, month);

  const toggleClient = (id: string) => {
    setExpandedClients((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <>
      <div className="bg-white border-b border-gray-200 px-4 md:px-7 py-3.5 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button onClick={onMenuToggle} className="md:hidden border border-gray-200 rounded-md p-1.5 text-gray-600">
            <MenuIcon />
          </button>
          <span className="text-[17px] font-semibold">Reports</span>
        </div>
      </div>

      <div className="p-4 md:p-7 max-w-[1200px]">
        {/* Month nav */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => changeMonth(-1)}
            className="border border-gray-200 rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <ChevronLeftIcon />
          </button>
          <span className="text-[17px] font-semibold min-w-[160px] text-center">{monthLabel}</span>
          <button
            onClick={() => changeMonth(1)}
            className="border border-gray-200 rounded-md p-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition"
          >
            <ChevronRightIcon />
          </button>
        </div>

        {/* Summary cards */}
        <div className="flex gap-4 mb-6 flex-wrap">
          <StatCard label="Total Hours" value={formatHours(totalSeconds)} sub="this month" />
          <StatCard label="Active Clients" value={String(clientCount)} sub="with tracked time" />
          <StatCard
            label="Avg Per Day"
            value={totalSeconds > 0 ? formatHours(totalSeconds / days) : "0.0"}
            sub="hours / day"
          />
        </div>

        {/* Client breakdown */}
        {sortedClients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BarChartIcon className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm">No tracked time this month</p>
          </div>
        ) : (
          sortedClients.map(([clientId, cl]) => {
            const pct = Math.round((cl.seconds / maxSec) * 100);
            const isOpen = expandedClients.has(clientId);
            const sortedProjects = Object.entries(cl.projects).sort(
              (a, b) => b[1].seconds - a[1].seconds
            );

            return (
              <div
                key={clientId}
                className="bg-white border border-gray-200 rounded-xl mb-3 shadow-sm overflow-hidden"
              >
                {/* Header */}
                <button
                  onClick={() => toggleClient(clientId)}
                  className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-gray-50 transition text-left"
                >
                  <span className="font-semibold text-sm flex items-center gap-2">
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    {cl.name}
                  </span>
                  <span className="font-mono text-[15px] font-semibold text-indigo-600">
                    {formatHours(cl.seconds)}h
                  </span>
                </button>

                {/* Progress bar */}
                <div className="mx-4 mb-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Details */}
                {isOpen && (
                  <div className="border-t border-gray-100">
                    {sortedProjects.map(([projId, proj]) => (
                      <div key={projId}>
                        <div className="flex items-center justify-between px-4 py-2.5 pl-9 text-[13px] border-b border-gray-50 hover:bg-gray-50 transition">
                          <span className="text-gray-500">{proj.name}</span>
                          <span className="font-mono font-semibold text-gray-700">
                            {formatHours(proj.seconds)}h
                          </span>
                        </div>
                        {proj.tasks
                          .sort((a, b) => b.seconds - a.seconds)
                          .map((t, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between px-4 py-1.5 pl-14 text-xs border-b border-gray-50 text-gray-400"
                            >
                              <span>{t.name}</span>
                              <span className="font-mono">{formatHours(t.seconds)}h</span>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex-1 min-w-[140px] bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">
        {label}
      </div>
      <div className="text-2xl font-bold font-mono text-gray-900">{value}</div>
      <div className="text-xs text-gray-400 mt-0.5">{sub}</div>
    </div>
  );
}
