// src/features/scholar/dashboard/ApplicationsPage.tsx
import * as React from "react";
import { Link, useSearchParams } from "react-router";
import { Pagination } from "antd";
import {
  useGetMyApplicationsQuery,
  useGetMyApplicationStatsQuery,
  type Paged,
} from "../../../../redux/services/scholar/api";

type AppItem = {
  _id: string;
  scholarshipId: string;
  scholarshipTitle: string;
  category?: string;
  selectionMethod?: string;
  applicationStatus:
    | "Submitted"
    | "UnderReview"
    | "Shortlisted"
    | "Rejected"
    | "Awarded"
    | "Withdrawn";
  createdAt?: string;
  updatedAt?: string;
};

const TABS = [
  { key: "All", label: "All" },
  { key: "Submitted", label: "Submitted" },
  { key: "UnderReview", label: "Under Review" },
  { key: "Shortlisted", label: "Shortlisted" },
  { key: "Rejected", label: "Rejected" },
  { key: "Awarded", label: "Awarded" },
  { key: "Withdrawn", label: "Withdrawn" },
] as const;

const pillCls: Record<string, string> = {
  Submitted: "bg-indigo-100 text-indigo-700",
  UnderReview: "bg-amber-100 text-amber-700",
  Shortlisted: "bg-blue-100 text-blue-700",
  Rejected: "bg-rose-100 text-rose-700",
  Awarded: "bg-emerald-100 text-emerald-700",
  Withdrawn: "bg-gray-100 text-gray-600",
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => (
  <span
    className={`rounded-full px-2 py-0.5 text-xs ${
      pillCls[status] ?? "bg-gray-100 text-gray-700"
    }`}
  >
    {status}
  </span>
);

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

export default function ApplicationsPage() {
  const [sp, setSp] = useSearchParams();

  // Read params (with defaults)
  const tabKey = (sp.get("tab") || "All") as (typeof TABS)[number]["key"];
  const [page, setPage] = React.useState<number>(
    parseInt(sp.get("page") || "1", 10) || 1
  );
  const [limit, setLimit] = React.useState<number>(
    parseInt(sp.get("limit") || "12", 10) || 12
  );
  const [q, setQ] = React.useState<string>(sp.get("q") || "");

  // Keep URL in sync when local state changes
  React.useEffect(() => {
    const next = new URLSearchParams(sp); // IMPORTANT: new instance
    next.set("tab", tabKey);
    next.set("page", String(page));
    next.set("limit", String(limit));
    if (q) next.set("q", q);
    else next.delete("q");
    setSp(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabKey, page, limit, q]);

  // Reset page when changing tab
  React.useEffect(() => {
    setPage(1);
  }, [tabKey]);

  // Stats for tab badges
  const { data: stats } = useGetMyApplicationStatsQuery();

  // Map tab → status arg
  const statusParam = tabKey === "All" ? undefined : tabKey;

  // Query (refetches whenever args change)
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMyApplicationsQuery({ status: statusParam, page, limit, q });

  const paged = data as Paged<AppItem> | undefined;
  const rows = paged?.data ?? [];
  const total = paged?.meta?.total ?? 0;
  const busy = isLoading || isFetching;

  // Tab click handler (use new URLSearchParams!)
  // inside ApplicationsPage

  const selectTab = (key: (typeof TABS)[number]["key"]) => {
    // clear search and reset pagination
    setQ("");
    setPage(1);

    const next = new URLSearchParams(sp);
    next.set("tab", key);
    next.set("page", "1");
    next.set("limit", String(limit));
    next.delete("q"); // 🚫 drop stale search
    setSp(next, { replace: true });
  };

  return (
    <div className="space-y-6">
      {/* Header + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">My Applications</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search applications…"
            className="w-56 rounded-md border px-3 py-1.5 text-sm"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
            onClick={() => {
              setPage(1); // 🔁 restart paging for new search
              refetch();
            }}
          >
            Search
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => {
          const selected = t.key === tabKey;
          const count =
            t.key === "All" ? stats?.total : (stats as any)?.[t.key];
          return (
            <button
              key={t.key}
              onClick={() => selectTab(t.key)}
              className={cn(
                "rounded-lg border border-gray-600 px-3 py-1.5 text-sm",
                selected
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "hover:bg-indigo-600"
              )}
            >
              {t.label}
              {typeof count === "number" && (
                <span
                  className={cn(
                    "ml-2 inline-flex min-w-[1.5rem] items-center justify-center rounded-full px-1.5 text-[11px]",
                    selected
                      ? "text-indigo-50 bg-indigo-500/40"
                      : "text-gray-700 bg-gray-100"
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Errors */}
      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load.{" "}
          <button onClick={() => refetch()} className="underline">
            Retry
          </button>
          <pre className="mt-2 text-xs opacity-70">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      )}

      {/* Empty / Loading */}
      {busy && rows.length === 0 && (
        <div className="p-4 text-sm text-gray-500">Loading…</div>
      )}
      {!busy && rows.length === 0 && (
        <div className="rounded-lg border  p-8 text-center text-sm text-gray-400">
          No applications yet.
        </div>
      )}

      {/* Cards */}
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((a) => (
          <li
            key={a._id}
            className="rounded-lg border border-gray-500 p-4 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-base font-semibold leading-tight">
                  {a.scholarshipTitle}
                </div>
                <div className="mt-0.5 text-xs text-gray-400">
                  {a.category ?? "—"} • {a.selectionMethod ?? "—"}
                </div>
              </div>
              <StatusPill status={a.applicationStatus} />
            </div>

            <div className="mt-3 text-xs text-gray-400">
              Applied: {fmtDate(a.createdAt)}
            </div>

            <div className="mt-4">
              <Link
                to={`/scholar/dashboard/applications/${a._id}`}
                className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                View details
              </Link>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex justify-center">
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            showSizeChanger
            pageSizeOptions={["6", "9", "12", "18", "24", "36"]}
            onChange={(p, ps) => {
              setPage(p);
              setLimit(ps);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        </div>
      )}
    </div>
  );
}
