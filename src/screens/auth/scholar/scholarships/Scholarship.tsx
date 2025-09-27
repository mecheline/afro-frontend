// src/features/scholar/dashboard/Scholarship.tsx
import * as React from "react";
import {
  useGetActiveScholarshipsQuery,
  useGetRecommendedScholarshipsQuery,
} from "../../../../redux/services/scholar/api";
import type {
  ScholarshipItem,
  Paged,
} from "../../../../redux/services/scholar/api";
import { Skeleton, Pagination } from "antd";
import { Link } from "react-router";

// local utility to avoid depending on "@/lib/utils"
const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function ScholarshipsPage() {
  const [tab, setTab] = React.useState<"all" | "recommended">("all");
  const [page, setPage] = React.useState<number>(1);
  const [limit, setLimit] = React.useState<number>(9); // 9 cards per page

  // --- ALL (SelfSelection) ---
  const {
    data: allPaged,
    isLoading: loadingAll,
    isFetching: fetchingAll,
    isError: isErrorAll,
    error: errorAll,
    refetch: refetchAll,
  } = useGetActiveScholarshipsQuery(
    { selectionMethod: "SelfSelection", page, limit },
    { skip: tab !== "all" }
  );

  // --- RECOMMENDED (server matches scholar profile) ---
  const {
    data: recPaged,
    isLoading: loadingRec,
    isFetching: fetchingRec,
    isError: isErrorRec,
    error: errorRec,
    refetch: refetchRec,
  } = useGetRecommendedScholarshipsQuery(
    { page, limit, selectionMethod: "SelfSelection" },
    { skip: tab !== "recommended" }
  );

  // Pick the visible dataset based on tab
  const paged: Paged<ScholarshipItem> | undefined =
    tab === "all" ? allPaged : recPaged;

  const isLoading =
    tab === "all" ? loadingAll || fetchingAll : loadingRec || fetchingRec;
  const isError = tab === "all" ? isErrorAll : isErrorRec;
  const error = tab === "all" ? errorAll : errorRec;
  const refetch = tab === "all" ? refetchAll : refetchRec;

  const items = paged?.data ?? [];
  const total = paged?.meta?.total ?? 0;

  // reset pagination when switching tabs
  React.useEffect(() => {
    setPage(1);
  }, [tab]);

  if (isError) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Scholarships</h1>
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load scholarships.{" "}
          <button
            onClick={() => refetch()}
            className="underline underline-offset-2"
          >
            Try again
          </button>
        </div>
        <pre className="text-xs opacity-70">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Scholarships</h1>

        {/* Tabs */}
        <div
          className={cn(
            "inline-flex rounded-lg border bg-white p-1 text-sm dark:border-gray-800 dark:bg-gray-900"
          )}
          role="tablist"
          aria-label="Scholarship tabs"
        >
          <button
            role="tab"
            aria-selected={tab === "all"}
            onClick={() => setTab("all")}
            className={cn(
              "rounded-md px-3 py-1.5",
              tab === "all"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            )}
          >
            All
          </button>
          <button
            role="tab"
            aria-selected={tab === "recommended"}
            onClick={() => setTab("recommended")}
            className={cn(
              "rounded-md px-3 py-1.5",
              tab === "recommended"
                ? "bg-indigo-600 text-white"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800"
            )}
          >
            Recommended
          </button>
        </div>
      </header>

      {/* Loading skeletons (Ant Design) */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
            >
              <Skeleton active title paragraph={{ rows: 3 }} />
              <div className="mt-4">
                <Skeleton.Button active />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && items.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {tab === "all" ? (
            <p>No active scholarships with self-selection yet.</p>
          ) : (
            <p>
              No recommended scholarships match your tertiary
              qualification/field. Update your profile to improve matches.
            </p>
          )}
        </div>
      )}

      {/* Cards */}
      {!isLoading && items.length > 0 && (
        <>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((s) => (
              <li
                key={s._id}
                className="group rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-semibold leading-tight">
                      {s.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-gray-500">
                      {s.category} • {s.selectionMethod}
                    </p>
                  </div>
                  {s.createdAt && (
                    <time
                      dateTime={s.createdAt}
                      className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      title={new Date(s.createdAt).toLocaleString()}
                    >
                      {new Date(s.createdAt).toLocaleDateString()}
                    </time>
                  )}
                </div>

                {s.eligibility?.description && (
                  <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
                    {s.eligibility.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
                  {s.eligibility?.minimumQualifications && (
                    <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-200">
                      Min: {s.eligibility.minimumQualifications}
                    </span>
                  )}
                  {s.eligibility?.fieldOfStudy && (
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200">
                      Field: {s.eligibility.fieldOfStudy}
                    </span>
                  )}
                  {typeof s.eligibility?.recipients === "number" && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                      {s.eligibility.recipients} recipient
                      {s.eligibility.recipients > 1 ? "s" : ""}
                    </span>
                  )}
                </div>

                <div className="mt-5">
                  <Link
                    to={`/scholar/dashboard/scholarships/${s._id}`}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    View details
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          <div className="mt-6 flex justify-center">
            <Pagination
              current={page}
              pageSize={limit}
              total={total}
              showSizeChanger
              pageSizeOptions={["6", "9", "12", "18", "24"]}
              onChange={(p, ps) => {
                setPage(p);
                setLimit(ps);
                // scroll to top of list on page change
                if (typeof window !== "undefined") {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}
