// Header.tsx
import { Menu, Bell, User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/services/scholar/store";
import { useLocation, matchPath } from "react-router"; // or react-router-dom

type Props = { onMenuClick: () => void };

// Centralize the sections your sidebar highlights.
// Use wildcard patterns so detail pages still match the parent label.
const SECTIONS: Array<{ label: string; pattern: string }> = [
  { label: "Scholarships", pattern: "/scholar/dashboard/scholarships/*" },
  { label: "Applications", pattern: "/scholar/dashboard/applications/*" },
  { label: "Profile", pattern: "/scholar/dashboard/profile/*" },
  { label: "Settings", pattern: "/scholar/dashboard/settings/*" },

  // sponsor area (if the same header is reused there)
  { label: "My Scholarships", pattern: "/sponsor/dashboard/scholarships/*" },
  { label: "Transactions", pattern: "/sponsor/dashboard/transactions/*" },
];

function useActiveHeaderTitle() {
  const { pathname } = useLocation();

  // Try to match one of the known sidebar sections
  const hit = SECTIONS.find((s) =>
    matchPath({ path: s.pattern, end: false }, pathname)
  );
  if (hit) return hit.label;

  // Fallback: derive something readable from the URL
  const parts = pathname.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "dashboard";
  return last.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

export default function Header({ onMenuClick }: Props) {
  const user = useSelector((state: RootState) => state.auth);
  const title = useActiveHeaderTitle();
  const notifications = 12; // set your count here
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white text-black">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          className="inline-flex items-center rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 lg:hidden dark:hover:bg-gray-800"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="size-5" />
        </button>

        <div className="ml-1 text-lg font-semibold sm:text-xl">{title}</div>

        <div className="ml-auto flex items-center gap-4">
          <button
            className="relative rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-800"
            aria-label="Notifications"
          >
            <Bell className="size-5" />

            {notifications > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex min-w-4 h-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-medium leading-none text-white ring-2 ring-white dark:ring-gray-950"
                aria-hidden="true"
              >
                {notifications > 99 ? "99+" : notifications}
              </span>
            )}

            {/* Optional: accessible live region for screen readers */}
            <span className="sr-only" aria-live="polite">
              {notifications} unread notifications
            </span>
          </button>
          <div className="flex flex-col">
            <div>
              Welcome{" "}
              <span role="img" aria-label="clapping hands">
                👏
              </span>
            </div>
            {user?.lastName ? (
              <div className="text-gray-400">
                {user?.lastName} {user?.firstName}
              </div>
            ) : (
              <div className="text-xs">{user?.email}</div>
            )}
          </div>

          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Profile"
              className="size-8 rounded-full ring-1 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <User className="size-5" />
          )}
        </div>
      </div>
    </header>
  );
}
