
import { Outlet } from "react-router";
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
      {/* Main Area: Sidebar + Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}

        <div
          className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300
    ${showSidebar ? "translate-x-0" : "-translate-x-full"}
    md:translate-x-0
  `}
        >
          <Sidebar onItemClick={closeSidebar} onClose={closeSidebar} />
        </div>

        {/* Mobile backdrop */}
        {showSidebar && (
          <div
            className="fixed inset-0 bg-black opacity-40 z-40 md:hidden"
            onClick={closeSidebar}
          />
        )}

        {/* Outlet Content */}
        <main className="flex-1 overflow-auto p-4 bg-[#F7F9FC]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SponsorDashboardLayout;
