// HouseholdRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";

type FormValues = {
  parentMaritalStatus:
    | "Married"
    | "Single"
    | "Separated"
    | "Divorced"
    | "Widowed";
  homeWith:
    | "Father"
    | "Mother"
    | "Both Parents"
    | "Guardian"
    | "Spouse"
    | "Alone"
    | "Relatives"
    | "Other";
  hasChildren: "Yes" | "No";
  childrenCount?: string;
};

const MARITAL: FormValues["parentMaritalStatus"][] = [
  "Married",
  "Single",
  "Separated",
  "Divorced",
  "Widowed",
];

const HOME_WITH: FormValues["homeWith"][] = [
  "Father",
  "Mother",
  "Both Parents",
  "Guardian",
  "Spouse",
  "Alone",
  "Relatives",
  "Other",
];

const HouseholdRHF: React.FC<{
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
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      parentMaritalStatus: "" as any,
      homeWith: "" as any,
      hasChildren: "" as any,
      childrenCount: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  const hasChildren = watch("hasChildren");

  const save = handleSubmit(async (v) => onSave?.(v));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-3xl font-extrabold text-slate-900">
            Household
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-5 sm:px-6 pb-40">
        {/* Parent marital status */}
        <section className="mt-6">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            Parent marital status
          </label>
          <div className="relative">
            <select
              {...register("parentMaritalStatus", {
                required: "Select marital status",
              })}
              className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                errors.parentMaritalStatus
                  ? "border-red-400"
                  : "border-slate-200"
              } ${
                !watch("parentMaritalStatus")
                  ? "text-slate-400"
                  : "text-slate-900"
              }`}
            >
              <option value="" disabled hidden>
                Choose status
              </option>
              {MARITAL.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.parentMaritalStatus?.message}
          </div>
        </section>

        {/* Permanent home with */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            With whom do you make your permanent home
          </label>
          <div className="relative">
            <select
              {...register("homeWith", { required: "Select an option" })}
              className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                errors.homeWith ? "border-red-400" : "border-slate-200"
              } ${!watch("homeWith") ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Choose person(s)
              </option>
              {HOME_WITH.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.homeWith?.message}
          </div>
        </section>

        {/* Children */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            Do you have any children
          </label>
          <div className="relative">
            <select
              {...register("hasChildren", { required: "Select Yes or No" })}
              className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                errors.hasChildren ? "border-red-400" : "border-slate-200"
              } ${!watch("hasChildren") ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Choose answer
              </option>
              <option>No</option>
              <option>Yes</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.hasChildren?.message}
          </div>
        </section>

        {hasChildren === "Yes" && (
          <section className="mt-2">
            <label className="mb-3 block text-base font-semibold text-slate-700">
              How many children?
            </label>
            <input
              type="number"
              min={1}
              {...register("childrenCount", {
                required: "Enter number of children",
                min: { value: 1, message: "Must be at least 1" },
              })}
              className={`h-12 w-full rounded-xl border bg-white px-4 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                errors.childrenCount ? "border-red-400" : "border-slate-200"
              }`}
              placeholder="e.g. 1"
            />
            <div className="min-h-5 mt-1 text-sm text-red-600">
              {errors.childrenCount?.message}
            </div>
          </section>
        )}
        <div className="mx-auto w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="h-12 rounded-2xl border-2 border-[#2F56D9] text-base font-semibold text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => onNext?.(getValues())}
              className="h-12 rounded-2xl bg-slate-100 text-base font-semibold text-[#2F56D9] shadow hover:bg-slate-200 focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HouseholdRHF;
