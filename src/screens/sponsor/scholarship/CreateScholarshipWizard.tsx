// src/features/scholarships/CreateScholarshipWizard.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import BottomBar from "./BottomBar";
import StepperHorizontal from "./StepperHorizontal";
import {
  useCreateScholarshipMutation,
  useGetScholarshipQuery,
  useInitFundingMutation,
  useSubmitScholarshipMutation,
  useUpdateScholarshipMutation,
  type Scholarship,
  type FundingPlanKey,
  type SelectionMethod,
} from "../../../redux/services/scholar/api";
import Step1Details from "./steps/Step1Details";
import Step2Funding from "./steps/Step2Funding";
import Step3Eligibility from "./steps/Step3Eligibility";
import Step5Selection from "./steps/Step5Selection";
import Step4Documents from "./steps/Step4Documents";

/* ---------------- Helpers ---------------- */
function computeInitialIndex(s: Scholarship): number {
  if (!s.steps.details) return 0;
  if (!s.funding?.isPaid) return 1;
  if (!s.steps.eligibility) return 2;
  if (!s.steps.selection) return 3;
  const needsDocs = s.selectionMethod === "SelfSelection";
  if (needsDocs && !s.steps.documents) return 4;
  return needsDocs ? 4 : 3;
}

/* ---------------- Skeletons ---------------- */
const cn = (...xs: Array<string | false | null | undefined>) =>
  xs.filter(Boolean).join(" ");

function SkeletonBar({
  w = "w-40",
  h = "h-4",
  className = "",
}: {
  w?: string;
  h?: string;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse rounded bg-gray-200", w, h, className)} />
  );
}

function SkeletonChip() {
  return <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />;
}

function SkeletonButton({ w = "w-28" }: { w?: string }) {
  return <div className={cn("h-9 animate-pulse rounded bg-gray-200", w)} />;
}

function SkeletonStepper() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="h-6 w-6 animate-pulse rounded-full bg-gray-200" />
          <SkeletonBar w="w-24" />
        </div>
      ))}
    </div>
  );
}

function SkeletonSection() {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 p-4">
      <SkeletonBar w="w-48" />
      <SkeletonBar w="w-80" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <SkeletonBar w="w-full" h="h-10" />
        <SkeletonBar w="w-full" h="h-10" />
      </div>
      <div className="flex items-center justify-end gap-2">
        <SkeletonButton w="w-24" />
        <SkeletonButton w="w-28" />
      </div>
    </div>
  );
}

function PageSkeleton() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 mt-12 pt-4">
      <div className="mb-4 flex items-center justify-between">
        <SkeletonBar w="w-48" />
        <SkeletonButton w="w-40" />
      </div>

      <div className="mb-4">
        <SkeletonStepper />
      </div>

      <SkeletonSection />
    </div>
  );
}

/* ---------------- Component ---------------- */
const CreateScholarshipWizard: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();

  const [idx, setIdx] = useState(0);
  const positionedRef = useRef(false);
  const pendingAdvanceRef = useRef<null | "to-docs">(null);

  const [createScholarship] = useCreateScholarshipMutation();
  const [updateScholarship] = useUpdateScholarshipMutation();
  const [initFunding] = useInitFundingMutation();
  const [submitScholarship] = useSubmitScholarshipMutation();

  const {
    data: sch,
    isFetching,
    isLoading, // initial load
    refetch,
  } = useGetScholarshipQuery(id!, { skip: !id });

  const isEditMode = !!sch?.steps?.submitted;
  const isDraft = !!sch && !sch.steps.submitted;

  type StepKey =
    | "details"
    | "funding"
    | "eligibility"
    | "selection"
    | "documents";

  const stepKeys: StepKey[] = useMemo(
    () =>
      sch?.selectionMethod === "SelfSelection"
        ? ["details", "funding", "eligibility", "selection", "documents"]
        : ["details", "funding", "eligibility", "selection"],
    [sch?.selectionMethod]
  );

  const stepLabels = useMemo(
    () =>
      stepKeys.map((k) => ({
        key: k,
        label:
          k === "details"
            ? "Details"
            : k === "funding"
            ? "Funding"
            : k === "eligibility"
            ? "Eligibility"
            : k === "selection"
            ? "Selection"
            : "Documents",
      })),
    [stepKeys]
  );

  const currentKey: StepKey | undefined = stepKeys[idx];

  // Make one-time positioning decision when scholarship arrives
  useEffect(() => {
    if (!sch || positionedRef.current) return;

    const stepParam = sp.get("step");
    if (stepParam) {
      const n = Math.max(
        1,
        Math.min(parseInt(stepParam, 10) || 1, stepKeys.length)
      );
      setIdx(n - 1);
    } else {
      setIdx(computeInitialIndex(sch));
    }
    positionedRef.current = true;
  }, [sch, sp, stepKeys.length]);

  // If step count changes (SelfSelection toggles), keep index in range
  useEffect(() => {
    setIdx((i) => Math.min(i, stepKeys.length - 1));
  }, [stepKeys.length]);

  // Deferred jump to documents after selection becomes SelfSelection
  useEffect(() => {
    if (pendingAdvanceRef.current === "to-docs") {
      const docIdx = stepKeys.indexOf("documents");
      if (docIdx !== -1) {
        setIdx(docIdx);
        pendingAdvanceRef.current = null;
      }
    }
  }, [stepKeys]);

  // Payment callback failure handling (optional)
  useEffect(() => {
    const status = sp.get("status");
    if (status?.toLowerCase() === "failed") setIdx(1);
  }, [sp]);

  const goNext = () => setIdx((i) => Math.min(i + 1, stepKeys.length - 1));
  const goPrev = () => setIdx((i) => Math.max(i - 1, 0));

  const isSubmitted = !!sch?.steps?.submitted;
  const formId = `sch-form-${idx}`;
  const isFundingStep = currentKey === "funding";
  const hideInternalButtons = isEditMode ? !isFundingStep : false;

  const submitCurrentForm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  // Global page-level skeleton while fetching an existing scholarship
  const showPageSkeleton = !!id && (isLoading || isFetching || !sch);

  if (!currentKey && !showPageSkeleton) return null;

  if (showPageSkeleton) {
    return <PageSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 mt-12 pt-4">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {sch?.active ? "Edit Scholarship" : "Create Scholarship"}
        </h1>
        {sch?.active ? (
          <button
            type="button"
            onClick={() => navigate("/sponsor/dashboard#scholarships")}
            className="rounded-md border px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
          >
            Return to Scholarships
          </button>
        ) : (
          <span className="sr-only">Create Mode</span>
        )}
      </div>

      {/* Stepper */}
      <div className="mb-4">
        {/* StepperHorizontal is kept; if you prefer a skeleton for internal fetches, use SkeletonStepper */}
        <StepperHorizontal steps={stepLabels} currentIndex={idx} />
      </div>

      {/* Step content */}
      {currentKey === "details" && (
        <Step1Details
          formId={formId}
          hideButtons={isEditMode ? !isFundingStep : false}
          initial={sch ?? undefined}
          isSubmitted={isEditMode}
          onSubmit={async (vals) => {
            if (sch) {
              // updating existing
              const hasLogoChange = !!vals.logoFile || vals.removeLogo;
              if (hasLogoChange) {
                const fd = new FormData();
                fd.append("title", vals.title);
                fd.append("category", vals.category);
                if (vals.logoFile) fd.append("logo", vals.logoFile);
                if (vals.removeLogo) fd.append("removeLogo", "true");
                fd.append("markStep", "details");
                await updateScholarship({ id: sch._id, patch: fd }).unwrap();
              } else {
                await updateScholarship({
                  id: sch._id,
                  patch: {
                    title: vals.title,
                    category: vals.category,
                    markStep: "details",
                  },
                }).unwrap();
              }
              if (isDraft) goNext();
            } else {
              // create new
              const fd = new FormData();
              fd.append("title", vals.title);
              fd.append("category", vals.category);
              if (vals.logoFile) fd.append("logo", vals.logoFile);

              const created = await createScholarship(fd).unwrap();
              navigate(`/sponsor/scholarships/${created._id}/edit?step=2`, {
                replace: true,
              });
            }
          }}
        />
      )}

      {sch && currentKey === "funding" && (
        <Step2Funding
          formId={formId}
          hideButtons={false}
          paid={!!sch.funding?.isPaid}
          initialPlan={sch.funding?.plan as FundingPlanKey | undefined}
          initialAmount={sch.funding?.amount}
          onInit={async (plan, amount) => {
            const { authorization_url } = await initFunding({
              id: sch._id,
              plan,
              amount,
            }).unwrap();
            window.location.href = authorization_url;
          }}
          onContinue={async () => {
            const refreshed = await refetch().unwrap();
            if (refreshed?.funding?.isPaid) goNext();
          }}
          onBack={goPrev}
        />
      )}

      {sch && currentKey === "eligibility" && (
        <Step3Eligibility
          formId={formId}
          hideButtons={hideInternalButtons}
          initial={sch.eligibility}
          isSubmitted={isSubmitted}
          onBack={goPrev}
          onSubmit={async (vals) => {
            await updateScholarship({
              id: sch._id,
              patch: {
                eligibility: vals,
                markStep: "eligibility",
                currentStep: 4,
              },
            }).unwrap();
            if (isDraft) goNext();
          }}
        />
      )}

      {sch && currentKey === "selection" && (
        <Step5Selection
          formId={formId}
          hideButtons={isEditMode ? true : false}
          initial={sch.selectionMethod as SelectionMethod | undefined}
          isSubmitted={isEditMode}
          onBack={goPrev}
          onSubmit={async (method) => {
            await updateScholarship({
              id: sch._id,
              patch: { selectionMethod: method, markStep: "selection" },
            }).unwrap();

            if (isDraft && method === "SelfSelection") {
              // Defer advance until "documents" appears in stepKeys
              pendingAdvanceRef.current = "to-docs";
            }
          }}
          onSubmitFinal={async () => {
            if (isEditMode) {
              await updateScholarship({ id: sch!._id, patch: {} }).unwrap();
            } else {
              const res = await submitScholarship({ id: sch!._id }).unwrap();
              if (res?.matchSummary) {
                navigate(
                  `/sponsor/dashboard/matched-scholars/${res.scholarship._id}`
                );
              }
            }
          }}
        />
      )}

      {sch && currentKey === "documents" && (
        <Step4Documents
          formId={formId}
          hideButtons={hideInternalButtons}
          initial={sch.documents}
          isSubmitted={isSubmitted}
          onBack={goPrev}
          onSubmit={async (d) => {
            await updateScholarship({
              id: sch._id,
              patch: { documents: d, markStep: "documents" },
            }).unwrap();
            // stay on documents
          }}
          onSubmitFinal={async () => {
            if (isSubmitted) {
              await updateScholarship({ id: sch!._id, patch: {} }).unwrap();
            } else {
              await submitScholarship({ id: sch!._id }).unwrap();
              navigate("/sponsor/dashboard?justCreated=1", { replace: true });
            }
          }}
        />
      )}

      {/* Bottom actions (edit mode; not on funding step) */}
      {isEditMode && currentKey !== "funding" && (
        <BottomBar
          onBack={goPrev}
          onMiddle={submitCurrentForm} // Update & stay
          onRight={goNext} // move forward; no API
          middleLabel="Update"
          rightLabel="Next"
        />
      )}
    </div>
  );
};

export default CreateScholarshipWizard;
