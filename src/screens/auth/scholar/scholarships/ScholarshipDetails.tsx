// src/features/scholar/dashboard/ScholarshipDetail.tsx
import * as React from "react";
import { useParams, Link } from "react-router";
import { Skeleton, Alert, Tag } from "antd";
import { useGetActiveScholarshipDetailQuery } from "../../../../redux/services/scholar/api";

const Row: React.FC<{ label: string; children?: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="grid grid-cols-12 gap-3 py-2 border-b border-gray-100 dark:border-gray-800">
    <div className="col-span-4 md:col-span-3 text-xs font-medium text-gray-500 uppercase">
      {label}
    </div>
    <div className="col-span-8 md:col-span-9">{children}</div>
  </div>
);

export default function ScholarshipDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } =
    useGetActiveScholarshipDetailQuery(id || "", {
      skip: !id,
    });

  const s = data?.scholarship;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">Scholarship Details</h1>
        <Link
          to="/scholar/dashboard/scholarships"
          className="text-sm text-indigo-600 hover:underline"
        >
          ← Back to scholarships
        </Link>
      </div>

      {isLoading && (
        <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <Skeleton active title paragraph={{ rows: 6 }} />
        </div>
      )}

      {isError && (
        <Alert
          type="error"
          message="Failed to load scholarship"
          description={
            <pre className="text-xs overflow-auto">
              {JSON.stringify(error, null, 2)}
            </pre>
          }
          action={
            <button onClick={() => refetch()} className="text-sm underline">
              Try again
            </button>
          }
          showIcon
        />
      )}

      {!isLoading && !isError && s && (
        <div className="rounded-lg border bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold leading-tight">{s.title}</h2>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                <Tag>{s.category}</Tag>
                <Tag color="blue">{s.selectionMethod}</Tag>
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

          <div className="mt-6">
            <Row label="Description">
              <p className="text-sm text-gray-700 dark:text-gray-300">
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

            <Row label="Recipients">
              <span className="text-sm">
                {typeof s.eligibility?.recipients === "number"
                  ? s.eligibility.recipients
                  : "—"}
              </span>
            </Row>

            <Row label="Documents">
              {Array.isArray(s.documents?.personal) ||
              Array.isArray(s.documents?.educational) ? (
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {(s.documents?.personal || []).map((d, i) => (
                    <li key={`p-${i}`}>Personal: {d}</li>
                  ))}
                  {(s.documents?.educational || []).map((d, i) => (
                    <li key={`e-${i}`}>Educational: {d}</li>
                  ))}
                  {s.documents?.deadline && (
                    <li>Deadline: {s.documents.deadline}</li>
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
