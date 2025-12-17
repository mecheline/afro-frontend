// src/features/scholar/dashboard/ScholarshipDetail.tsx
import * as React from "react";
import { Link, useParams } from "react-router";
import { Skeleton, Alert, Tag } from "antd";
import {
  useGetActiveScholarshipDetailQuery,
  useGetMyApplicationsQuery,
  type ScholarshipItem,
} from "../../../../redux/services/scholar/api";
import ApplyWizardModal from "./ApplyWizardModal";
import { Send } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

const Row: React.FC<{ label: string; children?: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-12 gap-3 border-b border-gray-100 py-3">
    <div className="col-span-4 md:col-span-3 text-xs font-medium text-gray-500 uppercase">
      {label}
    </div>
    <div className="col-span-8 md:col-span-9">{children}</div>
  </div>
);

export default function ScholarshipDetail() {
  const { id } = useParams<{ id: string }>();
  const [applyFor, setApplyFor] = React.useState<ScholarshipItem | null>(null);
  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetActiveScholarshipDetailQuery(id ?? "", { skip: !id });

  //  Load my applications once to know which scholarships are already applied
  //    (use a large page size; backend already caps to 50 in your controller. Adjust if needed.)
  const {
    data: myAppsPaged,
    refetch: refetchMyApps,
    isFetching: fetchingApps,
  } = useGetMyApplicationsQuery({ page: 1, limit: 50 }); // status omitted => all

  const appliedSet = React.useMemo(() => {
    const rows = myAppsPaged?.data ?? [];
    return new Set<string>(rows.map((a: any) => String(a.scholarshipId)));
  }, [myAppsPaged]);

  const s = data?.scholarship;
  const alreadyApplied = appliedSet.has(String(s?._id ?? ""));
  return (
    <div className="space-y-4">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Scholarship Details</h1>
        <Link
          to="/scholar/dashboard/scholarships"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to scholarships
        </Link>
      </div>

      {/* Loading */}
      {(isLoading || isFetching) && (
        <div className="rounded-lg border bg-white p-4">
          <Skeleton active title paragraph={{ rows: 8 }} />
        </div>
      )}

      {/* Error */}
      {isError && (
        <Alert
          type="error"
          showIcon
          message="Failed to load scholarship"
          description={
            <pre className="max-h-48 overflow-auto text-xs">
              {JSON.stringify(error, null, 2)}
            </pre>
          }
          action={
            <button onClick={() => refetch()} className="text-sm underline">
              Try again
            </button>
          }
        />
      )}

      {/* Empty (invalid id / not active) */}
      {!isLoading && !isError && !s && (
        <div className="rounded-lg border bg-white p-6 text-sm text-gray-600">
          Scholarship not found or not active.
        </div>
      )}

      <button
        onClick={() => s && setApplyFor(s)}
        disabled={alreadyApplied || fetchingApps}
        aria-disabled={alreadyApplied || fetchingApps}
        title={alreadyApplied ? "You have already applied" : undefined}
        className={cn(
          "inline-flex items-center rounded-md px-3 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white",
          alreadyApplied || fetchingApps ? "cursor-not-allowed" : ""
        )}
      >
        {alreadyApplied ? (
          "Applied"
        ) : (
          <span className="flex items-center gap-x-1">
            <Send size={14} /> Apply now
          </span>
        )}
      </button>

      {applyFor && (
        <ApplyWizardModal
          open
          scholarship={applyFor}
          onClose={() => {
            setApplyFor(null);
            // refresh my applications so the “Apply now” button disables instantly after submit
            refetchMyApps();
          }}
        />
      )}

      {/* Content */}
      {s && (
        <div className="rounded-lg border border-gray-200 bg-white py-8 px-4">
          {/* Header with logo & meta */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {/* Logo */}
              {s.logo?.url ? (
                <img
                  src={s.logo.url}
                  alt={`${s.title} logo`}
                  className="h-14 w-14 flex-shrink-0 rounded-full border object-cover dark:border-gray-700"
                />
              ) : (
                <div className="h-14 w-14 flex-shrink-0 rounded-md border bg-gray-50 text-[10px] text-gray-400 dark:border-gray-700 dark:bg-gray-800 flex items-center justify-center">
                  No logo
                </div>
              )}

              {/* Title + tags */}
              <div>
                <h2 className="text-lg font-semibold leading-tight">
                  {s.title}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <Tag>{s.category}</Tag>
                  {s.createdAt && (
                    <span className="rounded bg-gray-100 px-2 py-0.5 text-[11px] text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </span>
                  )}
                  {s.sponsorName && (
                    <span className="text-xs text-gray-500">
                      by {s.sponsorName}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="mt-6">
            <Row label="Description">
              <p className="text-sm text-gray-700">
                {s.eligibility?.description || "—"}
              </p>
            </Row>

            <Row label="Minimum Qualification">
              <span className="text-sm">
                {s.eligibility?.minimumQualifications || "—"}
              </span>
            </Row>

            <Row label="Field of Study">
              <span className="text-sm">
                {s.eligibility?.fieldOfStudy || "—"}
              </span>
            </Row>

            <Row label="Documents">
              {Array.isArray(s.documents?.personal) ||
              Array.isArray(s.documents?.educational) ||
              s.documents?.deadline ? (
                <ul className="list-disc space-y-1 pl-5 text-sm">
                  {(s.documents?.personal || []).map((d, i) => (
                    <li key={`p-${i}`}>Personal: {d}</li>
                  ))}
                  {(s.documents?.educational || []).map((d, i) => (
                    <li key={`e-${i}`}>Educational: {d}</li>
                  ))}
                  {s.documents?.deadline && (
                    <li>
                      Deadline:{" "}
                      {new Date(s.documents.deadline).toLocaleString()}
                    </li>
                  )}
                </ul>
              ) : (
                <span className="text-sm">—</span>
              )}
            </Row>
          </div>
        </div>
      )}
    </div>
  );
}
