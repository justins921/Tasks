"use client";

import { useState } from "react";
import { Section } from "@/lib/types";
import { AppDataProvider } from "@/hooks/useAppData";
import Sidebar from "@/components/Sidebar";
import TasksSection from "@/components/TasksSection";
import ClientsSection from "@/components/ClientsSection";
import ProjectsSection from "@/components/ProjectsSection";
import ReportsSection from "@/components/ReportsSection";

export default function Home() {
  const [section, setSection] = useState<Section>("tasks");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((o) => !o);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <AppDataProvider>
      <div className="flex min-h-screen">
        <Sidebar
          currentSection={section}
          onNavigate={setSection}
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />

        <main className="flex-1 md:ml-60 min-h-screen">
          {section === "tasks" && <TasksSection onMenuToggle={toggleSidebar} />}
          {section === "clients" && <ClientsSection onMenuToggle={toggleSidebar} />}
          {section === "projects" && <ProjectsSection onMenuToggle={toggleSidebar} />}
          {section === "reports" && <ReportsSection onMenuToggle={toggleSidebar} />}
        </main>
      </div>
    </AppDataProvider>
  );
}
