// src/features/applications/MatchedScholarDetails.tsx
import React from "react";
import { useNavigate, useParams } from "react-router";
import { ArrowLeft, RefreshCw, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import {
  useGetMatchedScholarDetailQuery,
  useSelectScholarForScholarshipMutation,
} from "../../redux/services/scholar/api";

function SkeletonSection() {
  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
      <div className="grid gap-3 md:grid-cols-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-4 w-32 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function MatchedScholarDetails() {
  const navigate = useNavigate();
  const { id, scholarId } = useParams<{ id: string; scholarId: string }>();

  const { data, isLoading, isFetching, isError, error, refetch } =
    useGetMatchedScholarDetailQuery(
      { scholarshipId: id as string, scholarId: scholarId as string },
      { skip: !id || !scholarId }
    );

  const [selectScholar, { isLoading: isFunding }] =
    useSelectScholarForScholarshipMutation();

  const scholar: any = data?.scholar;
  const app: any = data?.application;

  const avatarUrl =
    scholar?.avatar?.url ||
    (scholar?.profile as any)?.personal?.avatar?.url ||
    undefined;

  const fullName =
    scholar?.firstName || scholar?.lastName
      ? `${scholar?.firstName ?? ""} ${scholar?.lastName ?? ""}`.trim()
      : "Scholar";

  const education = (scholar?.profile as any)?.education;
  const tertiary = education?.tertiary;

  // 🔹 SSCE exams (profile.ssce)
  const ssce = (scholar?.profile as any)?.ssce;
  const hasSsceExams =
    !!ssce && Array.isArray(ssce.exams) && ssce.exams.length > 0;

  // 🔹 Uploaded result files (profile.result)
  const results = (scholar?.profile as any)?.result;
  const hasResultFiles =
    !!results &&
    !!(
      results.ssce ||
      results.primary ||
      (Array.isArray(results.others) && results.others.length > 0)
    );

  const hasResultsSection = hasSsceExams || hasResultFiles;

  const effectiveScholarId: string | undefined =
    (scholar as any)?._id || scholarId || undefined;

  const handleFundScholar = async () => {
    if (!id || !effectiveScholarId) {
      toast.error("Missing scholarship or scholar identifier");
      return;
    }

    try {
      await selectScholar({
        scholarshipId: id,
        scholarId: effectiveScholarId,
        // MatchedScholar → profile only, no applicationId
      }).unwrap();
      toast.success("Matched scholar queued for verification and funding");
    } catch (err: any) {
      toast.error(
        err?.data?.message ||
          "Unable to fund matched scholar. Please try again."
      );
    }
  };

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="group mb-6 inline-flex items-center gap-x-1 rounded-md px-1 py-0.5 text-sm text-gray-700 transition-all duration-200 hover:-translate-x-0.5 hover:text-indigo-600"
      >
        <ArrowLeft className="size-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
        Back to list
      </button>

      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="size-14 rounded-full object-cover ring-2 ring-indigo-100"
            />
          ) : (
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-600 text-lg font-semibold text-white">
              {fullName
                .split(" ")
                .map((p) => p[0])
                .join("")
                .toUpperCase() || "S"}
            </div>
          )}

          <div>
            <h1 className="text-lg font-semibold">{fullName}</h1>
            <p className="text-xs text-gray-500">
              Matched for:{" "}
              <span className="font-medium">
                {data?.scholarshipTitle ?? "Scholarship"}
              </span>
            </p>
          </div>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isFetching ? "animate-spin" : ""}`} />
          {isFetching ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* Loading */}
      {(isLoading || isFetching) && !data && (
        <div className="space-y-4">
          <SkeletonSection />
          <SkeletonSection />
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Failed to load scholar details
          {(error as any)?.data?.msg ? `: ${(error as any).data.msg}` : "."}
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && data && scholar && (
        <div className="space-y-6">
          {/* Basic info */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              Basic Information
            </h2>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <InfoRow label="Full Name" value={fullName} />
              <InfoRow label="Email" value={scholar.email} />
              <InfoRow label="Phone" value={scholar.phone || "—"} />
              <InfoRow label="Gender" value={scholar.gender || "—"} />
              <InfoRow
                label="Current Degree"
                value={scholar.currentDegree || "—"}
              />
              <InfoRow
                label="Country of Residence"
                value={scholar.countryOfResidence || "—"}
              />
            </div>
          </section>

          {/* Education snapshot */}
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              Education
            </h2>
            <div className="grid gap-3 text-sm md:grid-cols-2">
              <InfoRow
                label="Minimum Qualification"
                value={tertiary?.minQualification || "—"}
              />
              <InfoRow
                label="Field of Study"
                value={
                  tertiary?.fieldOfStudyLabel || tertiary?.fieldOfStudy || "—"
                }
              />
              <InfoRow label="CGPA" value={tertiary?.cgpa || "—"} />
            </div>
          </section>

          {/* ✅ Results & Certifications */}
          {hasResultsSection && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">
                Results &amp; Certifications
              </h2>

              <div className="space-y-6 text-sm">
                {/* SSCE Exams breakdown */}
                {hasSsceExams && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      SSCE Exams
                    </h3>

                    <div className="space-y-3">
                      {ssce.exams.map((exam: any, idx: number) => (
                        <div
                          key={idx}
                          className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                        >
                          <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-600">
                            <span>
                              <span className="font-semibold text-gray-700">
                                Board:
                              </span>{" "}
                              {exam.board || "—"}
                            </span>
                            <span>
                              <span className="font-semibold text-gray-700">
                                Exam No:
                              </span>{" "}
                              {exam.examNumber || "—"}
                            </span>
                            <span>
                              <span className="font-semibold text-gray-700">
                                Date:
                              </span>{" "}
                              {exam.date || "—"}
                            </span>
                          </div>

                          {Array.isArray(exam.subjects) &&
                            exam.subjects.length > 0 && (
                              <div className="mt-2 rounded-md bg-white p-2 text-xs">
                                <div className="mb-1 flex justify-between text-[11px] font-semibold text-gray-500">
                                  <span>Subject</span>
                                  <span>Grade</span>
                                </div>
                                <ul className="space-y-1">
                                  {exam.subjects.map(
                                    (subj: any, sIdx: number) => (
                                      <li
                                        key={sIdx}
                                        className="flex items-center justify-between"
                                      >
                                        <span className="text-gray-700">
                                          {subj.subject || "—"}
                                        </span>
                                        <span className="font-medium text-gray-900">
                                          {subj.grade || "—"}
                                        </span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Uploaded result files */}
                {hasResultFiles && (
                  <div>
                    <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Uploaded Result Files
                    </h3>
                    <div className="space-y-3">
                      {results?.ssce && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500">
                            SSCE Result
                          </span>
                          <a
                            href={results.ssce}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            <FileText className="size-3.5" />
                            View SSCE
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      )}

                      {results?.primary && (
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-gray-500">
                            Primary Certificate
                          </span>
                          <a
                            href={results.primary}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                          >
                            <FileText className="size-3.5" />
                            View Primary
                            <ExternalLink className="size-3.5" />
                          </a>
                        </div>
                      )}

                      {Array.isArray(results?.others) &&
                        results.others.length > 0 && (
                          <div>
                            <h4 className="mb-1 text-[11px] font-semibold uppercase text-gray-500">
                              Other Results
                            </h4>
                            <ul className="space-y-1 text-xs">
                              {results.others.map((r: any, idx: number) =>
                                r?.url ? (
                                  <DocItem
                                    key={r.label || `other-${idx}`}
                                    label={r.label || "Result"}
                                    url={r.url}
                                  />
                                ) : null
                              )}
                            </ul>
                          </div>
                        )}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Application snapshot (if they have applied) */}
          {app && (
            <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-gray-800">
                  Application Snapshot
                </h2>
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  Status: {app.applicationStatus}
                </span>
              </div>

              <div className="grid gap-4 text-sm md:grid-cols-2">
                <InfoRow
                  label="Applicant Name"
                  value={app.applicant?.fullName || fullName}
                />
                <InfoRow
                  label="Applicant Email"
                  value={app.applicant?.email || scholar.email}
                />
                <InfoRow
                  label="Applicant Phone"
                  value={app.applicant?.phone || scholar.phone || "—"}
                />
                <InfoRow
                  label="Field of Study (snapshot)"
                  value={app.snapshot?.fieldOfStudy || "—"}
                />
                <InfoRow
                  label="Min. Qualification (snapshot)"
                  value={app.snapshot?.minimumQualifications || "—"}
                />
                <InfoRow
                  label="Employment Status"
                  value={app.currentStatus?.employmentStatus || "—"}
                />
                <InfoRow
                  label="Current Degree (snapshot)"
                  value={app.currentStatus?.currentDegree || "—"}
                />
                <InfoRow
                  label="CGPA (snapshot)"
                  value={app.currentStatus?.cgpa || "—"}
                />
              </div>

              {/* Documents & letters */}
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                    Documents
                  </h3>
                  <ul className="space-y-1 text-xs">
                    {Object.entries(app.documents?.personal || {}).map(
                      ([label, url]) => (
                        <DocItem key={`p-${label}`} label={label} url={url} />
                      )
                    )}
                    {Object.entries(app.documents?.educational || {}).map(
                      ([label, url]) => (
                        <DocItem key={`e-${label}`} label={label} url={url} />
                      )
                    )}
                    {!app.documents && (
                      <li className="text-gray-500">No documents uploaded.</li>
                    )}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                    CV &amp; Motivation
                  </h3>
                  <div className="space-y-2 text-xs">
                    {app.letters?.cvUrl ? (
                      <a
                        href={app.letters.cvUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-50"
                      >
                        <FileText className="size-3.5" />
                        View CV
                        <ExternalLink className="size-3.5" />
                      </a>
                    ) : (
                      <p className="text-gray-500">No CV provided.</p>
                    )}

                    {app.letters?.motivation ? (
                      <div className="rounded-md bg-gray-50 p-3 text-gray-700">
                        <p className="mb-1 text-[11px] font-semibold text-gray-500">
                          Motivation
                        </p>
                        <p className="max-h-40 overflow-y-auto text-xs leading-relaxed">
                          {app.letters.motivation}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500">No motivation letter.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      <div className="mt-4 flex items-center justify-center rounded-xl bg-white py-6 shadow-md">
        <button
          onClick={handleFundScholar}
          disabled={isFunding}
          className="flex items-center justify-center rounded-md border border-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
        >
          {isFunding ? "Processing…" : "Fund Scholar"}
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="max-w-xs text-sm font-medium text-gray-800">
        {value && value !== "" ? value : "—"}
      </span>
    </div>
  );
}

function DocItem({ label, url }: { label: string; url: any }) {
  if (!url) return null;
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="truncate text-gray-700">{label}</span>
      <a
        href={String(url)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700"
      >
        <FileText className="size-3" />
        <ExternalLink className="size-3" />
      </a>
    </li>
  );
}
