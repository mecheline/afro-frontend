import * as React from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useGetMyApplicationByIdQuery } from "../../../../redux/services/scholar/api";

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

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="rounded-lg border border-gray-200 p-4 shadow-sm">
    <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
      {title}
    </h3>
    {children}
  </section>
);

/* const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" "); */

export default function ApplicationDetailsPage() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch } = useGetMyApplicationByIdQuery(
    appId!
  );
  const a = data;

  if (isLoading)
    return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  if (isError || !a)
    return (
      <div className="space-y-3 p-4">
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Failed to load application.{" "}
          <button onClick={() => refetch()} className="underline">
            Retry
          </button>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-indigo-600 underline"
        >
          Go back
        </button>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">{a.scholarshipTitle}</h1>
          <div className="text-xs text-gray-500">
            {a.category ?? "—"} • {a.selectionMethod ?? "—"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusPill status={a.applicationStatus} />
          <Link
            to="/scholar/dashboard/applications"
            className="rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 hover:text-black"
          >
            Back to Applications
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section title="Applicant">
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <dt className="col-span-1 text-gray-500">Name</dt>
            <dd className="col-span-2">{a.applicant?.fullName ?? "—"}</dd>

            <dt className="col-span-1 text-gray-500">Email</dt>
            <dd className="col-span-2">{a.applicant?.email ?? "—"}</dd>

            <dt className="col-span-1 text-gray-500">Phone</dt>
            <dd className="col-span-2">{a.applicant?.phone ?? "—"}</dd>

            <dt className="col-span-1 text-gray-500">DOB</dt>
            <dd className="col-span-2">
              {a.applicant?.dob
                ? new Date(a.applicant.dob).toLocaleDateString()
                : "—"}
            </dd>

            <dt className="col-span-1 text-gray-500">Gender</dt>
            <dd className="col-span-2">{a.applicant?.gender ?? "—"}</dd>
          </dl>
        </Section>

        <Section title="Current Status">
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <dt className="col-span-1 text-gray-500">Employment</dt>
            <dd className="col-span-2">
              {a.currentStatus?.employmentStatus ?? "—"}
            </dd>

            <dt className="col-span-1 text-gray-500">Degree</dt>
            <dd className="col-span-2">
              {a.currentStatus?.currentDegree ?? "—"}
            </dd>

            <dt className="col-span-1 text-gray-500">CGPA</dt>
            <dd className="col-span-2">{a.currentStatus?.cgpa ?? "—"}</dd>
          </dl>
        </Section>

        <Section title="Eligibility Snapshot (at submission)">
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <dt className="col-span-1 text-gray-500">Min Qualification</dt>
            <dd className="col-span-2">
              {a.snapshot?.minimumQualifications ?? "—"}
            </dd>

            <dt className="col-span-1 text-gray-500">Field of Study</dt>
            <dd className="col-span-2">{a.snapshot?.fieldOfStudy ?? "—"}</dd>
          </dl>
        </Section>

        <Section title="Letters">
          <div className="text-sm">
            <div className="mb-2">
              <span className="font-medium">CV: </span>
              {a.letters?.cvUrl ? (
                <a
                  href={a.letters.cvUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 underline"
                >
                  View CV
                </a>
              ) : (
                "—"
              )}
            </div>
            <div>
              <div className="font-medium">Motivation:</div>
              <p className="mt-1 whitespace-pre-wrap text-gray-700">
                {a.letters?.motivation || "—"}
              </p>
            </div>
          </div>
        </Section>

        <Section title="Documents — Personal">
          {a.documents?.personal &&
          Object.keys(a.documents.personal).length > 0 ? (
            <ul className="list-inside list-disc text-sm">
              {Object.entries(a.documents.personal).map(([k, url]) => (
                <li key={k}>
                  <span className="font-medium">{k}:</span>{" "}
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">No personal documents.</div>
          )}
        </Section>

        <Section title="Documents — Educational">
          {a.documents?.educational &&
          Object.keys(a.documents.educational).length > 0 ? (
            <ul className="list-inside list-disc text-sm">
              {Object.entries(a.documents.educational).map(([k, url]) => (
                <li key={k}>
                  <span className="font-medium">{k}:</span>{" "}
                  <a
                    href={String(url)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm text-gray-500">
              No educational documents.
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
