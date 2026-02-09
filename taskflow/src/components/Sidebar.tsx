"use client";

import { Section } from "@/lib/types";
import {
  CheckSquareIcon,
  UsersIcon,
  FolderIcon,
  BarChartIcon,
  LinkIcon,
} from "./Icons";

interface SidebarProps {
  currentSection: Section;
  onNavigate: (section: Section) => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { section: Section; label: string; icon: React.ReactNode }[] = [
  { section: "tasks", label: "Tasks", icon: <CheckSquareIcon /> },
  { section: "clients", label: "Clients", icon: <UsersIcon /> },
  { section: "projects", label: "Projects", icon: <FolderIcon /> },
];

export default function Sidebar({
  currentSection,
  onNavigate,
  isOpen,
  onClose,
}: SidebarProps) {
  const handleNav = (section: Section) => {
    onNavigate(section);
    onClose();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-60 bg-white border-r border-gray-200
          flex flex-col z-50 transition-transform duration-200
          md:translate-x-0
          ${isOpen ? "translate-x-0 shadow-xl" : "-translate-x-full"}
        `}
      >
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-500 bg-clip-text text-transparent">
            KISS
          </h1>
          <span className="text-[11px] text-gray-400 uppercase tracking-wide">
            Task Manager
          </span>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((item) => (
            <button
              key={item.section}
              onClick={() => handleNav(item.section)}
              className={`
                flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150
                ${
                  currentSection === item.section
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }
              `}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          <div className="h-px bg-gray-100 my-2 mx-3" />

          <button
            onClick={() => handleNav("reports")}
            className={`
              flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150
              ${
                currentSection === "reports"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <BarChartIcon />
            Reports
          </button>

          <button
            onClick={() => handleNav("integrations")}
            className={`
              flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-lg text-sm font-medium
              transition-all duration-150
              ${
                currentSection === "integrations"
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }
            `}
          >
            <LinkIcon />
            Integrations
          </button>
        </nav>
      </aside>
    </>
  );
}
