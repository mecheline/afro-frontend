// FuturePlansRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";

type FormValues = {
  describeYou:
    | ""
    | "High school student"
    | "Undergraduate"
    | "Graduate"
    | "Working professional"
    | "Entrepreneur"
    | "Other";
  highestDegree:
    | ""
    | "Certificate"
    | "Diploma"
    | "Bachelor’s"
    | "Graduate"
    | "Master’s"
    | "Doctoral"
    | "Professional";
  careerInterest:
    | ""
    | "Chartered Accountant"
    | "Software Engineer"
    | "Doctor"
    | "Lawyer"
    | "Teacher"
    | "Data Analyst"
    | "Entrepreneur"
    | "Civil Engineer"
    | "Nurse";
};

const DESCRIBE_OPTIONS: Exclude<FormValues["describeYou"], "">[] = [
  "High school student",
  "Undergraduate",
  "Graduate",
  "Working professional",
  "Entrepreneur",
  "Other",
];

const DEGREE_INTENT: Exclude<FormValues["highestDegree"], "">[] = [
  "Certificate",
  "Diploma",
  "Bachelor’s",
  "Graduate",
  "Master’s",
  "Doctoral",
  "Professional",
];

const CAREERS: Exclude<FormValues["careerInterest"], "">[] = [
  "Chartered Accountant",
  "Software Engineer",
  "Doctor",
  "Lawyer",
  "Teacher",
  "Data Analyst",
  "Entrepreneur",
  "Civil Engineer",
  "Nurse",
];

const FuturePlansRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      describeYou: "",
      highestDegree: "",
      careerInterest: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (v) => onSave?.(v));

  const isDescPlaceholder = watch("describeYou") === "";
  const isDegPlaceholder = watch("highestDegree") === "";
  const isCareerPlaceholder = watch("careerInterest") === "";

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
            Future Plans
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Which best describes you */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Which best describes you
          </label>
          <div className="relative">
            <select
              {...register("describeYou", {
                required: "Please select an option",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.describeYou
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isDescPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select
              </option>
              {DESCRIBE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
            {errors.describeYou?.message}
          </div>
        </div>

        {/* Highest degree you intend to earn */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Highest degree you intend to earn
          </label>
          <div className="relative">
            <select
              {...register("highestDegree", {
                required: "Please select a degree",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.highestDegree
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isDegPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select degree
              </option>
              {DEGREE_INTENT.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
            {errors.highestDegree?.message}
          </div>
        </div>

        {/* Career interest */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Career interest
          </label>
          <div className="relative">
            <select
              {...register("careerInterest", {
                required: "Please select a career interest",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.careerInterest
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isCareerPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select career
              </option>
              {CAREERS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
            {errors.careerInterest?.message}
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-4">
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

export default FuturePlansRHF;
