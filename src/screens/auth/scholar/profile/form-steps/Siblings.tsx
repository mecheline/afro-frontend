// SiblingsRHF.tsx
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";

/* type FormValues = {
  count: number; // how many siblings
  ages: (number | "")[]; // dynamic ages
}; */


type FormValues = {
  count: number;
  ages: { value: number | "" }[];
};
const MAX_SIBLINGS = 10;

const SiblingsRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    control,
    handleSubmit,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      count: 0,
      ages: [],
      ...initialData,
    },
    mode: "onTouched",
  });

  //const { replace, fields } = useFieldArray({ name: "ages", control });
  const { replace, fields } = useFieldArray({
    control,
    name: "ages", // ✅ now valid
  });

  // Keep ages array length in sync with "count"
  const count = Math.max(
    0,
    Math.min(MAX_SIBLINGS, Number(watch("count") ?? 0))
  );

  useEffect(() => {
    const curr = getValues("ages") ?? [];
    if (curr.length !== count) {
      // preserve existing values as much as possible
      const next = Array.from({ length: count }, (_, i) => curr[i] ?? "");
      replace(next);
    }
  }, [count, getValues, replace]);

  const save = handleSubmit(async (v) => onSave?.(v));

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
            Siblings
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* How many siblings */}
        <div className="mt-6">
          <label className="mb-2 block text-lg text-slate-700">
            How many siblings
          </label>
          <div className="relative">
            <select
              {...register("count", { valueAsNumber: true })}
              className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {Array.from({ length: MAX_SIBLINGS + 1 }).map((_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Dynamic ages */}
        <div className="mt-6 space-y-5">
          {fields.map((f, idx) => (
            <div key={f.id}>
              <label className="mb-2 block text-lg text-slate-700">
                Age Sibling ({idx + 1})
              </label>
              <input
                type="number"
                min={0}
                max={120}
                placeholder="e.g. 14"
                {...register(`ages.${idx}` as const, {
                  required: "Age is required",
                  valueAsNumber: true,
                  min: { value: 0, message: "Must be 0 or more" },
                  max: { value: 120, message: "Unrealistic age" },
                })}
                className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base font-semibold shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                  errors.ages?.[idx]
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
              />
              {/* reserved error space to avoid layout shift */}
              {/*  <div className="min-h-5 mt-1 text-sm text-red-600">
                {errors.ages?.[idx]?.message as string}
              </div> */}
              {errors.ages?.[idx]?.value && (
                <div className="min-h-5 mt-1 text-sm text-red-600">
                  {errors.ages[idx]?.value?.message}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mx-auto w-full max-w-xl mt-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={save}
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
        </div>
      </main>
    </div>
  );
};

export default SiblingsRHF;
