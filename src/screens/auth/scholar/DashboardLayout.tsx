/* import { Outlet } from "react-router";
import Header from "./Header";

const ScholarDashboardLayout = () => {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <Header />
      <div className="mt-16">
        <Outlet />
      </div>
      
    </div>
  );
};

export default ScholarDashboardLayout; */

import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function ScholarDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-auto max-w-screen-2xl min-h-dvh bg-gray-50">
      {/* Mobile sidebar (drawer) */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        variant="mobile"
      />

      {/* Desktop layout */}
      <div className="lg:grid lg:grid-cols-[280px_1fr] lg:min-h-dvh">
        <Sidebar open variant="desktop" />

        <div className="flex min-h-dvh flex-col">
          <Header onMenuClick={() => setSidebarOpen(true)} />

          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
