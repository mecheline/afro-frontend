// src/features/scholar/dashboard/HomeDashboard.tsx
import * as React from "react";
import { Link } from "react-router";
import { Skeleton } from "antd";
import {
  useGetActiveScholarshipsQuery,
  useGetMyApplicationsQuery,
  type Paged,
  type ScholarshipItem,
} from "../../../redux/services/scholar/api";

/* ---------- tiny helpers ---------- */
const cn = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : "—";

const statusPillCls: Record<string, string> = {
  Submitted: "bg-indigo-100 text-indigo-700",
  UnderReview: "bg-amber-100 text-amber-700",
  Shortlisted: "bg-blue-100 text-blue-700",
  Rejected: "bg-rose-100 text-rose-700",
  Awarded: "bg-emerald-100 text-emerald-700",
  Withdrawn: "bg-gray-100 text-gray-600",
};

/* ---------- cards ---------- */
const ScholarshipCard: React.FC<{ s: ScholarshipItem }> = ({ s }) => (
  <li className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold leading-tight line-clamp-1">
          {s.title}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">{s.category}</p>
      </div>
      {s.createdAt && (
        <time
          dateTime={s.createdAt}
          className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          title={new Date(s.createdAt).toLocaleString()}
        >
          {fmtDate(s.createdAt)}
        </time>
      )}
    </div>

    {s.eligibility?.description && (
      <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-gray-300">
        {s.eligibility.description}
      </p>
    )}

    <div className="mt-4 flex gap-2">
      <Link
        to={`/scholar/dashboard/scholarships/${s._id}`}
        className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        View details
      </Link>
    </div>
  </li>
);

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
};

const ApplicationCard: React.FC<{ a: AppItem }> = ({ a }) => (
  <li className="rounded-lg border bg-white p-4 shadow-sm transition hover:shadow-md dark:border-gray-800 dark:bg-gray-900">
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-base font-semibold leading-tight line-clamp-1">
          {a.scholarshipTitle}
        </h3>
        <p className="mt-0.5 text-xs text-gray-500">{a.category ?? "—"}</p>
      </div>
      {a.createdAt && (
        <time
          dateTime={a.createdAt}
          className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300"
          title={new Date(a.createdAt).toLocaleString()}
        >
          {fmtDate(a.createdAt)}
        </time>
      )}
    </div>

    <div className="mt-3">
      <span
        className={cn(
          "rounded-full px-2 py-0.5 text-xs",
          statusPillCls[a.applicationStatus] ?? "bg-gray-100 text-gray-700"
        )}
      >
        {a.applicationStatus}
      </span>
    </div>

    <div className="mt-4 flex gap-2">
      <Link
        to={`/scholar/dashboard/applications/${a._id}`}
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-50"
      >
        View application
      </Link>
    </div>
  </li>
);

/* ---------- main ---------- */
export default function HomeDashboard() {
  // Top: 6 latest active scholarships
  const {
    data: schPaged,
    isLoading: loadingSch,
    isFetching: fetchingSch,
    isError: errSch,
    refetch: refetchSch,
  } = useGetActiveScholarshipsQuery({
    page: 1,
    limit: 6,
    selectionMethod: "SelfSelection",
  });

  // Bottom: 6 latest applications (all statuses)
  const {
    data: appPaged,
    isLoading: loadingApp,
    isFetching: fetchingApp,
    isError: errApp,
    refetch: refetchApp,
  } = useGetMyApplicationsQuery({
    page: 1,
    limit: 6,
  });

  const schItems = (schPaged as Paged<ScholarshipItem> | undefined)?.data ?? [];
  const appItems = (appPaged as Paged<AppItem> | undefined)?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Scholarships */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Scholarships</h2>
          <Link
            to="/scholar/dashboard/scholarships"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {errSch ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Failed to load scholarships.{" "}
            <button onClick={() => refetchSch()} className="underline">
              Retry
            </button>
          </div>
        ) : (loadingSch || fetchingSch) && schItems.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
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
        ) : schItems.length === 0 ? (
          <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            No active scholarships yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {schItems.map((s) => (
              <ScholarshipCard key={s._id} s={s} />
            ))}
          </ul>
        )}
      </section>

      {/* Applications */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Applications</h2>
          <Link
            to="/scholar/dashboard/applications?tab=Submitted"
            className="text-sm text-indigo-600 hover:underline"
          >
            View all
          </Link>
        </div>

        {errApp ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            Failed to load applications.{" "}
            <button onClick={() => refetchApp()} className="underline">
              Retry
            </button>
          </div>
        ) : (loadingApp || fetchingApp) && appItems.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <Skeleton active title paragraph={{ rows: 2 }} />
                <div className="mt-4">
                  <Skeleton.Button active />
                </div>
              </div>
            ))}
          </div>
        ) : appItems.length === 0 ? (
          <div className="rounded-md border bg-white p-6 text-center text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            You haven’t submitted any applications yet.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {appItems.map((a) => (
              <ApplicationCard key={a._id} a={a} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
