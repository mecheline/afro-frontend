import { Fragment, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useLocation } from "react-router";
import {
  X,
  LayoutGrid,
  BarChart3,
  Settings,
  GraduationCap,
  User,
  ChevronDown,
  ChevronRight,
  LogOut,
} from "lucide-react";
import clsx from "clsx";
import logo from "../../../assets/logo.png";
import useScholarLogout from "../../../hooks/useScholarLogout";

type Variant = "mobile" | "desktop";
type Props = { open?: boolean; onClose?: () => void; variant: Variant };

const mainNav = [
  { to: "/scholar/dashboard", label: "Dashboard", icon: LayoutGrid, end: true },
  {
    to: "/scholar/dashboard/scholarships",
    label: "Scholarships",
    icon: GraduationCap,
  },
  {
    to: "/scholar/dashboard/applications",
    label: "Applications",
    icon: BarChart3,
  },
  { to: "/scholar/dashboard/settings", label: "Settings", icon: Settings },
];

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
  { key: "bank", name: "Bank Details" },
  { key: "cbo", name: "Community Based Org." },
  { key: "leadership", name: "Leadership Track Record" },
  { key: "future", name: "Future Plans" },
  { key: "activity", name: "Activity" },
  { key: "additional", name: "Additional Info" },
  { key: "ssce", name: "SSCE Examinations" },
  { key: "result", name: "Result" },
] as const;

/* --- Portal Modal (always above everything) --- */
function ConfirmLogoutModal({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}) {
  // Prevent body scroll while modal is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-title"
        className="relative z-[10000] w-[95%] max-w-sm rounded-lg border border-gray-200 bg-white p-5 shadow-2xl"
      >
        <h3 id="logout-title" className="text-lg font-semibold">
          Log out
        </h3>
        <p className="mt-1 text-sm text-gray-600">
          Are you sure you want to log out?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Continue
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

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

      <div
        className={clsx(
          "overflow-hidden transition-[max-height] duration-300",
          open ? "max-h-[1000px]" : "max-h-0"
        )}
      >
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
  const logout = useScholarLogout();
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex h-full flex-col">
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
        <ProfileGroup onItemClick={onClick} />
      </nav>

      <div className="mt-auto border-t p-3 dark:border-gray-800">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mb-12 rounded-full p-2 cursor-pointer z-50 flex items-center gap-x-1 text-white
             transition-all duration-200 ease-out
             hover:-translate-y-0.5 hover:scale-105 
             hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/60"
          aria-label="Log out"
        >
          <LogOut size={18} /> Logout
        </button>
      </div>

      {/* Portal modal (always topmost) */}
      <ConfirmLogoutModal
        open={showConfirm}
        onCancel={() => setShowConfirm(false)}
        onConfirm={async () => {
          setShowConfirm(false);
          await logout();
        }}
      />
    </div>
  );
}

export default function Sidebar({ open, onClose, variant }: Props) {
  if (variant === "desktop") {
    return (
      <aside className="sticky top-0 hidden h-dvh border-r border-gray-200 bg-white lg:block dark:border-gray-800 dark:bg-gray-900">
        <div className="flex h-dvh flex-col">
          <div className="flex h-16 items-center px-4">
            <img
              src={logo}
              alt="logo"
              className="rounded-full bg-white p-1 text-white"
            />
          </div>
          <div className="min-h-0 flex-1">
            <NavItems />
          </div>
        </div>
      </aside>
    );
  }

  return (
    <Fragment>
      <div
        className={clsx(
          "fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden="true"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={clsx(
          "fixed inset-y-0 left-0 z-50 w-80 transform bg-white shadow-xl transition-transform dark:bg-gray-900 lg:hidden flex flex-col",
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
        <div className="min-h-0 flex-1">
          <NavItems onClick={onClose} />
        </div>
      </div>
    </Fragment>
  );
}
