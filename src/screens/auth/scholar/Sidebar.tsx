import { Fragment, useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router"; // <-- fix import
import {
  X,
  LayoutGrid,
  BarChart3,
  Settings,
  GraduationCap,
  User,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import logo from "../../../assets/logo.png";

type Variant = "mobile" | "desktop";
type Props = { open?: boolean; onClose?: () => void; variant: Variant };

/** Primary nav (excluding Profile, which becomes a collapsible group) */
const mainNav = [
  { to: "/scholar/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
  {
    to: "/scholar/dashboard/scholarships",
    label: "Scholarships",
    icon: GraduationCap,
    end: true,
  },
  {
    to: "/scholar/dashboard/applications",
    label: "Applications",
    icon: BarChart3,
  },
  { to: "/scholar/dashboard/settings", label: "Settings", icon: Settings },
];

/** Profile steps -> child links under Profile group */
const profileSteps = [
  { key: "personal", name: "Personal Info" },
  { key: "address", name: "Address" },
  { key: "contact", name: "Contact Details" },
  { key: "demographics", name: "Demographics" },
  { key: "language", name: "Language" },
  { key: "geo", name: "Geography and nationality" },
  { key: "household", name: "Household" },
  { key: "parent", name: "Parent" },
  { key: "siblings", name: "Siblings" },
  { key: "education", name: "Education" },
  { key: "financial", name: "Financial Analysis" },
  { key: "cbo", name: "Community Based Org." },
  { key: "leadership", name: "Leadership Track Record" },
  { key: "future", name: "Future Plans" },
  { key: "activity", name: "Activity" },
  { key: "additional", name: "Additional Info" },
  { key: "ssce", name: "SSCE Examinations" },
  { key: "result", name: "Result" },
] as const;

function ProfileGroup({ onItemClick }: { onItemClick?: () => void }) {
  const location = useLocation();
  const isOnProfile = location.pathname.startsWith(
    "/scholar/dashboard/profile"
  );
  const [open, setOpen] = useState(isOnProfile);

  useEffect(() => {
    if (isOnProfile) setOpen(true);
  }, [isOnProfile]);

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={clsx(
          "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
          isOnProfile
            ? "bg-indigo-600 text-white"
            : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
        )}
      >
        <User className="size-4 shrink-0" />
        <span className="truncate">Profile</span>
        {open ? (
          <ChevronDown className="ml-auto size-4" />
        ) : (
          <ChevronRight className="ml-auto size-4" />
        )}
      </button>

      {/* Collapsible container with height animation */}
      <div
        className={clsx(
          "overflow-hidden transition-[max-height] duration-300",
          open ? "max-h-[1000px]" : "max-h-0"
        )}
      >
        {/* Scrollable inner wrapper with thin scrollbar */}
        <div className="max-h-64 overflow-y-auto pr-1 scrollbar-thin">
          <nav className="mt-1 space-y-1 pl-7 pr-1">
            {profileSteps.map(({ key, name }) => (
              <NavLink
                key={key}
                to={`/scholar/dashboard/profile/${key}`}
                onClick={onItemClick}
                className={({ isActive }) =>
                  clsx(
                    "block rounded-md px-3 py-2 text-sm",
                    isActive
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200"
                      : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                  )
                }
              >
                {name}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

function NavItems({ onClick }: { onClick?: () => void }) {
  return (
    <nav className="mt-4 space-y-1 px-3">
      {mainNav.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onClick}
          className={({ isActive }) =>
            clsx(
              "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium",
              isActive
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}

      {/* Collapsible Profile group */}
      <ProfileGroup onItemClick={onClick} />
    </nav>
  );
}

export default function Sidebar({ open, onClose, variant }: Props) {
  // Desktop: static column
  if (variant === "desktop") {
    return (
      <aside className="sticky top-0 hidden h-dvh border-r border-gray-200 bg-white lg:block dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-16 items-center px-4">
          <img
            src={logo}
            alt="logo"
            className="text-white bg-white p-1 rounded-full"
          />
        </div>
        <NavItems />
      </aside>
    );
  }

  // Mobile: slide-over drawer
  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl transition-transform dark:bg-gray-900 lg:hidden",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          <img src={logo} alt="logo" />
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:hover:bg-gray-800"
            aria-label="Close menu"
          >
            <X className="size-5" />
          </button>
        </div>
        <NavItems onClick={onClose} />
      </div>
    </Fragment>
  );
}
