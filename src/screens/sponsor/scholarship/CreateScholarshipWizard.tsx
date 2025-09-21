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

function computeInitialIndex(s: Scholarship): number {
  if (!s.steps.details) return 0;
  if (!s.funding?.isPaid) return 1;
  if (!s.steps.eligibility) return 2;
  if (!s.steps.selection) return 3;
  const needsDocs = s.selectionMethod === "SelfSelection";
  if (needsDocs && !s.steps.documents) return 4;
  return needsDocs ? 4 : 3;
}

const CreateScholarshipWizard: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const positionedRef = useRef(false);
  //const isEdit = Boolean(id);

  const [idx, setIdx] = useState(0);
  const [createScholarship] = useCreateScholarshipMutation();
  const [updateScholarship] = useUpdateScholarshipMutation();
  const [initFunding] = useInitFundingMutation();
  const [submitScholarship] = useSubmitScholarshipMutation();

  const {
    data: sch,
    isFetching,
    refetch,
  } = useGetScholarshipQuery(id!, { skip: !id });

  const pendingAdvanceRef = useRef<null | "to-docs">(null);

  // whenever the step array changes (e.g., selection becomes SelfSelection -> documents appears),
  // perform the pending jump once

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

  const currentKey: StepKey | undefined = stepKeys[idx];
  if (!currentKey) return null; // safety

  useEffect(() => {
    if (pendingAdvanceRef.current === "to-docs") {
      const docIdx = stepKeys.indexOf("documents");
      if (docIdx !== -1) {
        setIdx(docIdx);
        pendingAdvanceRef.current = null;
      }
    }
  }, [stepKeys]); // <-- IMPORTANT: runs after the list grows to include "documents"

  // KEYS & LABELS
  /*   const stepKeys = useMemo(
    () =>
      sch?.selectionMethod === "SelfSelection"
        ? ([
            "details",
            "funding",
            "eligibility",
            "selection",
            "documents",
          ] as const)
        : (["details", "funding", "eligibility", "selection"] as const),
    [sch?.selectionMethod]
  ); */
  /*  const stepLabels = useMemo(
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
  ); */

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

  // Respect ?step=1|2|3|4|5 when present (1-based for humans)
  /*  useEffect(() => {
    const stepParam = sp.get("step");
    if (stepParam) {
      const n = Math.max(
        1,
        Math.min(parseInt(stepParam, 10) || 1, stepKeys.length)
      );
      setIdx(n - 1);
    } else if (sch && !isEditMode) {
      // In create mode, you could still auto-position; for edit we stay wherever user asked
      setIdx(computeInitialIndex(sch));
    }
  }, [sp, stepKeys.length, sch, isEditMode]); */

  /*   useEffect(() => {
    const stepParam = sp.get("step");
    if (stepParam) {
      const n = Math.max(
        1,
        Math.min(parseInt(stepParam, 10) || 1, stepKeys.length)
      );
      setIdx(n - 1);
    } else if (sch) {
      setIdx(computeInitialIndex(sch)); // ← draft resumes; submitted also lands on “last complete”
    }
  }, [sp, stepKeys.length, sch]); */

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
    positionedRef.current = true; // <- do not auto-reset again on future sch updates
  }, [sch, sp, stepKeys.length]);

  // If selection method changes and step count shrinks/expands, clamp idx
  useEffect(() => {
    setIdx((i) => Math.min(i, stepKeys.length - 1));
  }, [stepKeys.length]);

  // Payment callback failure handling (optional)
  useEffect(() => {
    const status = sp.get("status");
    if (status?.toLowerCase() === "failed") setIdx(1);
  }, [sp]);

  const goNext = () => setIdx((i) => Math.min(i + 1, stepKeys.length - 1));
  const goPrev = () => setIdx((i) => Math.max(i - 1, 0));

  if (id && (isFetching || !sch)) return <div className="p-6">Loading…</div>;
  const isSubmitted = !!sch?.steps?.submitted;
  const formId = `sch-form-${idx}`;
  const isFundingStep = stepKeys[idx] === "funding";
  //const hideInternalButtons = isEdit ? !isFundingStep : false;
  const hideInternalButtons = isEditMode ? !isFundingStep : false;

  // Funding “Continue” (no API on Next; Continue uses refetch)
  const handleFundingContinue = async () => {
    const refreshed = await refetch().unwrap();
    if (refreshed?.funding?.isPaid) goNext();
  };

  // UPDATE action = submit current form (no advance)
  const submitCurrentForm = () => {
    const form = document.getElementById(formId) as HTMLFormElement | null;
    form?.requestSubmit();
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-4">
      {/* Top bar */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold">
          {sch?.active ? "Edit Scholarship" : "Create Scholarship"}
        </h1>
        {sch?.active && (
          <button
            type="button"
            onClick={() => navigate("/sponsor/dashboard#scholarships")}
            className="rounded-md border px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50"
          >
            Return to Scholarships
          </button>
        )}
      </div>

      <div className="mb-4">
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
              await updateScholarship({
                id: sch._id,
                patch: {
                  title: vals.title,
                  category: vals.category,
                  markStep: "details",
                },
              }).unwrap();

              if (isDraft) goNext(); // ← advance in draft
            } else {
              const created = await createScholarship(vals).unwrap();
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

            if (isDraft) goNext(); // ← advance in draft
          }}
        />
      )}

      {sch && currentKey === "selection" && (
        <Step5Selection
          formId={formId}
          hideButtons={isEditMode ? true : false} // in draft show internal Proceed
          initial={sch.selectionMethod as SelectionMethod | undefined}
          isSubmitted={isEditMode}
          onBack={goPrev}
          onSubmit={async (method) => {
            await updateScholarship({
              id: sch._id,
              patch: { selectionMethod: method, markStep: "selection" },
            }).unwrap();

            if (isDraft && method === "SelfSelection") {
              // defer the advance until stepKeys includes "documents"
              pendingAdvanceRef.current = "to-docs";
            }
            // MatchedScholar: finalization still happens on Submit
          }}
          onSubmitFinal={async () => {
            if (isEditMode) {
              await updateScholarship({ id: sch!._id, patch: {} }).unwrap();
            } else {
              await submitScholarship({ id: sch!._id }).unwrap();
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

            // stay here
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

      {/* Bottom actions: hide on funding step; Next does NOT call API */}
      {isEditMode && currentKey !== "funding" && (
        <BottomBar
          onBack={goPrev}
          onMiddle={submitCurrentForm} // Update = submit & stay
          onRight={goNext} // Next = just move forward, no API
          middleLabel="Update"
          rightLabel="Next"
        />
      )}
    </div>
  );
};

export default CreateScholarshipWizard;
