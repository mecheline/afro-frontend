// src/features/applications/Applications.tsx
import React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { useGetScholarshipApplicationsQuery } from "../../redux/services/scholar/api";
import { fmtDate } from "../../constants/Format";
import { ArrowLeft } from "lucide-react";

type DocPair = { label: string; url: string };

const Badge: React.FC<{
  tone?: "green" | "gray" | "blue";
  children: React.ReactNode;
}> = ({ tone = "gray", children }) => {
  const map: Record<string, string> = {
    green: "bg-green-100 text-green-700",
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-100 text-blue-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      {children}
    </span>
  );
};

const ApplicantCard: React.FC<{
  schId: string;
  app: any;
}> = ({ schId, app }) => {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            {app?.applicant?.fullName}
          </h3>
          <p className="text-sm text-gray-600">{app?.applicant?.email}</p>
          <p className="text-sm text-gray-600">{app?.applicant?.phone}</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Badge tone="blue">{app?.applicationStatus}</Badge>
          <p className="text-xs text-gray-500">
            Applied: {fmtDate(app?.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="text-sm">
          <div className="text-gray-500">Minimum Qualification</div>
          <div className="font-medium text-gray-900">
            {app?.snapshot?.minimumQualifications || "—"}
          </div>
        </div>
        <div className="text-sm">
          <div className="text-gray-500">Field of Study</div>
          <div className="font-medium text-gray-900">
            {app?.snapshot?.fieldOfStudy || "—"}
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        {/* Pass the whole application via route state for instant detail view */}
        <Link
          to={`/sponsor/dashboard/applications/${schId}/application/${app._id}`}
          state={{
            application: app,
            scholarshipId: schId,
            title: app.scholarshipTitle,
          }}
          className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm text-white bg-gray-900"
        >
          View details
        </Link>
      </div>
    </div>
  );
};

const Applications: React.FC = () => {
  const { id: scholarshipId = "" } = useParams();
  const router = useNavigate();
  const { data, isLoading, isError } = useGetScholarshipApplicationsQuery({
    id: scholarshipId,
  });

  if (isLoading)
    return <div className="p-6 text-gray-500">Loading applications…</div>;
  if (isError)
    return <div className="p-6 text-red-600">Failed to load applications.</div>;

  const apps = data?.data ?? [];

  return (
    <div className="space-y-4">
      <button
        onClick={() => router(-1)}
        className="group inline-flex items-center gap-x-1 rounded-md px-1 py-0.5 mb-6
             text-sm text-gray-700 transition-all duration-200 ease-out
             hover:text-indigo-600 hover:-translate-x-0.5"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />
        Back
      </button>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-sm text-gray-600">
            {data?.title} • Total: {data?.total ?? 0}
          </p>
        </div>
      </div>

      {apps.length === 0 ? (
        <div className="rounded-lg border bg-white p-6 text-center text-gray-500">
          No applications yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {apps.map((app: any) => (
            <ApplicantCard
              key={app._id}
              schId={String(data?.scholarshipId)}
              app={app}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Applications;
