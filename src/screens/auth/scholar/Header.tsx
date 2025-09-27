/* import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/services/scholar/store";
import { Link } from "react-router";
import { Bell } from "lucide-react";

const Header = () => {
  const user = useSelector((state: RootState) => state.auth);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to={"/scholar/dashboard"} className="flex items-center gap-3">
            <img
              src={user?.avatar ?? undefined}
              className="h-9 w-9 rounded-full object-cover"
              alt="avatar"
            />
            <div>
              <p className="text-xs text-slate-500">Good Morning 👋</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.lastName} {user?.firstName}
              </p>
            </div>
          </Link>
           <Link to={"/scholar/profile"}>Profile</Link> 
          <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
 */

import { Menu, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/services/scholar/store";
import { Avatar } from "antd";

type Props = { onMenuClick: () => void };

export default function Header({ onMenuClick }: Props) {
  const user = useSelector((state: RootState) => state.auth);
  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          className="inline-flex items-center rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden dark:hover:bg-gray-800"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="ml-1 text-lg font-semibold sm:text-xl">Dashboard</div>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden sm:block">
            <input
              type="search"
              placeholder="Search…"
              className="w-48 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <button
            className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
          </button>
          {user?.avatar ? (
            <img
              src={user?.avatar}
              alt="Profile"
              className="size-8 rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <User />
          )}
        </div>
      </div>
    </header>
  );
}
