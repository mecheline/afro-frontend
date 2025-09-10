// FinancialAnalysisRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  tuitionFees: string; // store as string; format with thousands separators
  accommodationFees: string;
  feedingAllowance: string;
  notes?: string;
};

const formatNum = (v: string) => {
  if (!v) return "";
  // keep digits and a single dot
  const clean = v.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
  if (!clean) return "";
  const [int, dec] = clean.split(".");
  const withCommas = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec !== undefined ? `${withCommas}.${dec}` : withCommas;
};

const FinancialAnalysisRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      tuitionFees: "",
      accommodationFees: "",
      feedingAllowance: "",
      notes: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  const save = handleSubmit(async (v) => onSave?.(v));

  // helpers to attach to numeric inputs for pretty formatting
  const regCurrency = (name: keyof FormValues) =>
    register(name as any, {
      onChange: (e) => {
        setValue(name as any, formatNum(e.target.value), { shouldDirty: true });
      },
    });

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
            Financial Analysis
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Tuition */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Tuition fees (₦)
          </label>
          <input
            inputMode="decimal"
            placeholder="24,000"
            {...regCurrency("tuitionFees")}
            className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.tuitionFees
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
          {errors.tuitionFees && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.tuitionFees.message)}
            </p>
          )}
        </div>

        {/* Accommodation */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Accommodation fees (₦)
          </label>
          <input
            inputMode="decimal"
            placeholder="140,000"
            {...regCurrency("accommodationFees")}
            className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.accommodationFees
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
        </div>

        {/* Feeding */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Feeding Allowance (₦)
          </label>
          <input
            inputMode="decimal"
            placeholder="140,000"
            {...regCurrency("feedingAllowance")}
            className={`h-14 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.feedingAllowance
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
        </div>

        {/* Notes */}
        <div className="mt-8">
          <label className="mb-2 block text-base text-slate-700">
            Share more about your financial expenses
          </label>
          <textarea
            rows={8}
            placeholder="Tell us more about your financial situation…"
            {...register("notes")}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
          />
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

export default FinancialAnalysisRHF;
