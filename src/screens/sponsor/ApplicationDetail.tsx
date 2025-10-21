// src/features/applications/ApplicationDetail.tsx
import React, { useMemo } from "react";
import { Link, useLocation, useParams } from "react-router";
import { useGetScholarshipApplicationsQuery } from "../../redux/services/scholar/api";
import { fmtDate } from "../../constants/Format";
import { ArrowLeft } from "lucide-react";

type DocPair = { label: string; url: string };

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
    <h2 className="mb-3 text-sm font-semibold text-gray-700">{title}</h2>
    {children}
  </section>
);

const KeyVal: React.FC<{ k: string; v?: React.ReactNode }> = ({ k, v }) => (
  <div className="grid grid-cols-3 gap-2 py-1 text-sm">
    <div className="text-gray-500">{k}</div>
    <div className="col-span-2 font-medium text-gray-900">{v ?? "—"}</div>
  </div>
);

const DocList: React.FC<{ title: string; items: DocPair[] }> = ({
  title,
  items,
}) => (
  <Section title={title}>
    {items?.length ? (
      <ul className="space-y-2">
        {items.map((d) => (
          <li
            key={`${d.label}-${d.url}`}
            className="flex items-center justify-between"
          >
            <span className="text-sm text-gray-800">{d.label}</span>
            <a
              href={d.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-blue-700 hover:underline"
            >
              View
            </a>
          </li>
        ))}
      </ul>
    ) : (
      <div className="text-sm text-gray-500">None</div>
    )}
  </Section>
);

const ApplicationDetail: React.FC = () => {
  const { id } = useParams();
  const { appId } = useParams(); // in detail page
  const location = useLocation() as any;
  const fromState = location?.state?.application;
  const titleFromState = location?.state?.title;

  // If we navigated directly (no state), fetch and find the app by id
  const { data } = useGetScholarshipApplicationsQuery(
    { id: id },
    { skip: !!fromState }
  );
  const fallback = useMemo(() => {
    if (!data?.data) return null;
    return data.data.find((a: any) => String(a._id) === String(appId)) || null;
  }, [data, appId]);

  const app = fromState || fallback;

  if (!app) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Application not found.</p>
        <Link
          to={`/sponsor/dashboard/applications/${id}`}
          className="mt-3 inline-flex items-center rounded-md border px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
        >
          Back to applications
        </Link>
      </div>
    );
  }

  const personalDocs: DocPair[] = app?.documents?.personal ?? [];
  const educationalDocs: DocPair[] = app?.documents?.educational ?? [];
  const cvUrl: string = app?.letters?.cvUrl || "";
  const motivation: string = app?.letters?.motivation || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{app?.applicant?.fullName}</h1>
          <p className="text-sm text-gray-600">
            {titleFromState || app?.scholarshipTitle} • Applied{" "}
            {fmtDate(app?.createdAt)}
          </p>
        </div>
        <Link
          to={`/sponsor/dashboard/applications/${id}`}
          className="group inline-flex items-center gap-x-1 rounded-md px-1 py-0.5 mb-6
                     text-sm text-gray-700 transition-all duration-200 ease-out
                     hover:text-indigo-600 hover:-translate-x-0.5"
        >
          <ArrowLeft className="size-4 transition-transform duration-200 ease-out group-hover:-translate-x-0.5" />{" "}
          Back
        </Link>
      </div>

      <Section title="Applicant">
        <KeyVal k="Full name" v={app?.applicant?.fullName} />
        <KeyVal k="Email" v={app?.applicant?.email} />
        <KeyVal k="Phone" v={app?.applicant?.phone} />
        <KeyVal k="Date of birth" v={app?.applicant?.dob} />
        <KeyVal k="Gender" v={app?.applicant?.gender} />
      </Section>

      <Section title="Snapshot">
        <KeyVal
          k="Minimum qualification"
          v={app?.snapshot?.minimumQualifications}
        />
        <KeyVal k="Field of study" v={app?.snapshot?.fieldOfStudy} />
        <KeyVal k="Application status" v={app?.applicationStatus} />
      </Section>

      <Section title="Current Status">
        <KeyVal
          k="Employment status"
          v={app?.currentStatus?.employmentStatus}
        />
        <KeyVal k="Current degree" v={app?.currentStatus?.currentDegree} />
        <KeyVal k="CGPA" v={app?.currentStatus?.cgpa} />
      </Section>

      <DocList title="Personal documents" items={personalDocs} />
      <DocList title="Educational documents" items={educationalDocs} />

      <Section title="Letters">
        <KeyVal
          k="CV"
          v={
            cvUrl ? (
              <a
                href={cvUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-700 hover:underline"
              >
                View CV
              </a>
            ) : (
              "—"
            )
          }
        />
        <div className="mt-2">
          <div className="text-sm text-gray-500 mb-1">Motivation</div>
          <div className="whitespace-pre-wrap rounded-md border border-gray-200 p-3 text-sm text-gray-900">
            {motivation || "—"}
          </div>
        </div>
      </Section>
    </div>
  );
};

export default ApplicationDetail;
