// src/features/scholarships/steps/Step5Selection.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

type SelectionMethod = "SelfSelection" | "MatchedScholar";
type FormVals = { selectionMethod: SelectionMethod };

const Step5Selection: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: SelectionMethod;
  isSubmitted?: boolean;
  onBack: () => void;
  onSubmit: (m: SelectionMethod) => Promise<void> | void;
  onSubmitFinal: () => Promise<void> | void; // submit or update (final action)
}> = ({formId, hideButtons, initial, isSubmitted, onBack, onSubmit, onSubmitFinal }) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormVals>({
    defaultValues: {
      selectionMethod: (initial ?? "SelfSelection") as SelectionMethod,
    },
  });

  // IMPORTANT: when `initial` prop changes (edit/prefill), sync the form
  useEffect(() => {
    if (initial) {
      reset({ selectionMethod: initial });
    }
  }, [initial, reset]);

  const choice = watch("selectionMethod");
  const finalText = isSubmitted ? "Update" : "Submit";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (v) => {
        await onSubmit(v.selectionMethod);
        // If SelfSelection and not submitted yet, parent will advance to Docs step.
        // If MatchedScholar, final action is on the button below.
      })}
      className="space-y-4 sponsorLabel"
    >
      <div className="space-y-3">
        {/* Self Selection card */}
        <label
          className={`block rounded-xl border p-4 cursor-pointer ${
            choice === "SelfSelection"
              ? "border-blue-600 ring-1 ring-blue-200"
              : "border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              value="SelfSelection"
              {...register("selectionMethod", {
                required: "Please choose a selection method",
              })}
              className="mt-1"
            />
            <div>
              <div className="font-semibold">Self selection</div>
              <div className="text-sm text-gray-500">
                I want to receive applications from interested scholars before I
                select
              </div>
            </div>
          </div>
        </label>

        {/* Matched Scholar card */}
        <label
          className={`block rounded-xl border p-4 cursor-pointer ${
            choice === "MatchedScholar"
              ? "border-blue-600 ring-1 ring-blue-200"
              : "border-gray-300"
          }`}
        >
          <div className="flex items-start gap-3">
            <input
              type="radio"
              value="MatchedScholar"
              {...register("selectionMethod", {
                required: "Please choose a selection method",
              })}
              className="mt-1"
            />
            <div>
              <div className="font-semibold">Matched Scholar</div>
              <div className="text-sm text-gray-500">
                Recommended by MyAfroscholar app
              </div>
            </div>
          </div>
        </label>

        {errors.selectionMethod && (
          <p className="text-sm text-red-600">
            {errors.selectionMethod.message}
          </p>
        )}
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
          {choice === "MatchedScholar" ? (
            <button
              type="button"
              onClick={async () => {
                await onSubmit(choice);
                await onSubmitFinal();
              }}
              className="rounded-md bg-blue-600 p-3 text-white"
            >
              {finalText}
            </button>
          ) : (
            <button className="rounded-md bg-blue-600 p-3 text-white">
              {isSubmitted ? "Update" : "Proceed"}
            </button>
          )}
        </div>
      )}
    </form>
  );
};

export default Step5Selection;
