/* import { Outlet } from "react-router";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Menu } from "lucide-react";
import { useState } from "react";

const SponsorDashboardLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);

  const toggleSidebar = () => setShowSidebar((prev) => !prev);
  const closeSidebar = () => setShowSidebar(false);
  return (
    <div className="mx-auto max-w-screen-2xl flex flex-col h-screen">
      <header className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-center justify-between">
          <button
            className="text-gray-500 focus:outline-none md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-6 w-6" />
          </button>
          <Header />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300
    ${showSidebar ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
        >
          <Sidebar onItemClick={closeSidebar} onClose={closeSidebar} />
        </div>

        {showSidebar && (
          <div
            className="fixed inset-0 bg-black opacity-40 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SponsorDashboardLayout;
*/

import { useState } from "react";
import { Outlet } from "react-router";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function SponsorDashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="mx-auto max-w-screen-2xl min-h-dvh">
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

          <main className="flex-1 overflow-y-auto bg-gray-50">
            <div className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
