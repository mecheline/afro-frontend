// src/features/scholarships/steps/Step4Documents.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import moment from "moment";

type FormVals = {
  personal: string[];
  educational: string[];
  /** UI string for <input type="date"> in YYYY-MM-DD */
  deadline?: string;
  complete: boolean;
};

const DOCS_PERSONAL = [
  "Valid ID",
  "Int'l Passport",
  "Birth Certificate",
  "Local Government Certificate",
  "Medical Report",
];

const DOCS_EDU = [
  "Scanned copy of your passport",
  "Existing university degree certificate",
  "Two references",
  "Admission letter",
  "SOP",
];

const Step4Documents: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: Partial<FormVals> & {
    /** backend may send ISO or date-like */ deadline?: string | Date;
  };
  isSubmitted?: boolean;
  onBack: () => void;
  /** Sends data to backend (PATCH). Will receive deadline as ISO string. */
  onSubmit: (v: {
    personal: string[];
    educational: string[];
    deadline?: string;
    complete: boolean;
  }) => Promise<void> | void;
  /** Finalize (submit or update) */
  onSubmitFinal: () => Promise<void> | void;
}> = ({
  formId,
  hideButtons,
  initial,
  isSubmitted,
  onBack,
  onSubmit,
  onSubmitFinal,
}) => {
  const { register, handleSubmit, reset, watch } = useForm<FormVals>({
    defaultValues: {
      personal: [],
      educational: [],
      deadline: undefined, // MUST be YYYY-MM-DD for the input
      complete: false,
    },
  });

  // Prefill + normalize date for the <input type="date">
  useEffect(() => {
    if (!initial) return;

    const deadlineStr = initial.deadline
      ? moment(initial.deadline).isValid()
        ? moment(initial.deadline).format("YYYY-MM-DD")
        : undefined
      : undefined;

    reset({
      personal: initial.personal ?? [],
      educational: initial.educational ?? [],
      deadline: deadlineStr,
      complete: initial.complete ?? false,
    });
  }, [initial, reset]);

  const finalText = isSubmitted ? "Update" : "Submit";

  // Normalize outgoing payload: convert UI date (YYYY-MM-DD) -> ISO string
  const normalizeForApi = (vals: FormVals) => {
    const iso = vals.deadline
      ? moment(vals.deadline, "YYYY-MM-DD").isValid()
        ? moment(vals.deadline, "YYYY-MM-DD").toISOString()
        : undefined
      : undefined;

    return {
      personal: vals.personal,
      educational: vals.educational,
      deadline: iso, // <- backend gets ISO
      complete: true,
    };
  };

  const onFinal = async () => {
    const vals = watch();
    await onSubmit(normalizeForApi({ ...vals, complete: true }));
    await onSubmitFinal();
  };

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (vals) => {
        await onSubmit(normalizeForApi({ ...vals, complete: true }));
      })}
      className="space-y-6"
    >
      <div>
        <div className="mb-2 text-sm font-semibold">
          Supporting Documents (Personal)
        </div>
        <div className="rounded-xl border p-4">
          <div className="grid gap-3">
            {DOCS_PERSONAL.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <input type="checkbox" value={d} {...register("personal")} />{" "}
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className="mb-2 text-sm font-semibold">
          Supporting Documents (Educational)
        </div>
        <div className="rounded-xl border p-4">
          <div className="grid gap-3">
            {DOCS_EDU.map((d) => (
              <label key={d} className="flex items-center gap-2">
                <input type="checkbox" value={d} {...register("educational")} />{" "}
                {d}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">
          Deadline for Supporting Document
        </label>
        <input
          type="date"
          className="mt-1 w-full rounded-md border p-2"
          {...register("deadline")}
        />
        {/* Note: value is managed by RHF; prefill comes from reset() above */}
      </div>

      {!hideButtons && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border p-3"
          >
            Back
          </button>
          <button
            type="button"
            onClick={onFinal}
            className="rounded-md bg-blue-600 p-3 text-white"
          >
            {finalText}
          </button>
        </div>
      )}
    </form>
  );
};

export default Step4Documents;
