// ActivityRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  activityNote: string;
};

const ActivityRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      activityNote: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (v) => onSave?.(v));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-2xl font-extrabold text-slate-900">
            Activity
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        <label className="mb-3 mt-6 block text-lg text-slate-700">
          Do you have any activity you wish to report
        </label>

        <textarea
          {...register("activityNote", {
            maxLength: { value: 3000, message: "Max 3000 characters" },
          })}
          placeholder="Write here…"
          rows={10}
          className={`w-full rounded-2xl border bg-slate-50 px-4 py-4 text-base leading-relaxed shadow-sm focus:bg-white focus:outline-none focus:ring-4
            ${
              errors.activityNote
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
        />
        <div className="min-h-5 pt-1 text-sm text-red-600">
          {errors.activityNote?.message}
        </div>
        <div className="mx-auto w-full max-w-xl grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={isSaving}
            className="h-12 rounded-2xl border-2 border-[#2F56D9] text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => onNext?.(getValues())}
            className="h-12 rounded-2xl bg-slate-100 text-[#2F56D9] shadow hover:bg-slate-200 focus:outline-none"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default ActivityRHF;
