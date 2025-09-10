// SSCEExamsRHF.tsx
import React from "react";
import { useForm, useFieldArray } from "react-hook-form";
import type { Control } from "react-hook-form";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";

/* ---------- Types ---------- */
type MonthStr = string; // "2021-07"

type SubjectRow = { subject: string; grade: string };
type ExamAttempt = {
  date: MonthStr;
  board: "WAEC" | "NECO" | "GCE";
  examNumber: string; // <-- per-section exam number
  subjects: SubjectRow[];
};

type FormValues = {
  ssceCount: 1 | 2 | 3;
  exams: ExamAttempt[]; // one per SSCE
  scoreType: "Letter";
};

/* ---------- Options ---------- */
const SUBJECTS = [
  "Mathematics",
  "English Language",
  "Biology",
  "Chemistry",
  "Physics",
  "Further Mathematics",
  "Economics",
  "Government",
  "Geography",
  "Literature in English",
  "Civic Education",
  "Computer Studies",
  "Christian Religious Studies",
  "Islamic Religious Studies",
] as const;

const GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"] as const;

/* ---------- Nested Subjects table per SSCE ---------- */
const SubjectsForExam: React.FC<{
  control: Control<FormValues>;
  nestIndex: number;
}> = ({ control, nestIndex }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `exams.${nestIndex}.subjects` as const,
  });

  return (
    <div className="rounded-2xl border border-slate-200 p-3 sm:p-4">
      <div className="mb-2 text-base font-semibold text-slate-900">
        Subjects & Scores (SSCE {nestIndex + 1})
      </div>

      {fields.map((row, i) => (
        <div key={row.id} className="mb-3 grid gap-4 sm:grid-cols-2">
          {/* Subject */}
          <div className="relative">
            <label className="mb-2 block text-sm text-slate-700">
              Subject {i + 1}
            </label>
            <select
              {...(control.register(
                `exams.${nestIndex}.subjects.${i}.subject`
              ) as any)}
              className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-13 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Grade */}
          <div className="relative">
            <label className="mb-2 block text-sm text-slate-700">Score</label>
            <select
              {...(control.register(
                `exams.${nestIndex}.subjects.${i}.grade`
              ) as any)}
              className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-13 h-5 w-5 -translate-y-1/2 text-slate-400" />
          </div>

          {fields.length > 1 && (
            <div className="sm:col-span-2 -mt-1">
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove subject
              </button>
            </div>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ subject: "Mathematics", grade: "A1" })}
        className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-600 hover:bg-indigo-100"
      >
        <Plus className="h-4 w-4" /> Add another subject
      </button>
    </div>
  );
};

/* ---------- Main ---------- */
const SSCEExamsRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    control,
    watch,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      ssceCount: 1,
      exams: [
        {
          date: "",
          board: "WAEC",
          examNumber: "",
          subjects: [{ subject: "Mathematics", grade: "A1" }],
        },
      ],
      scoreType: "Letter",
      ...initialData,
    },
    mode: "onTouched",
  });

  const { fields: examFields, replace } = useFieldArray({
    control,
    name: "exams",
  });

  // Keep exams array length in sync with count
  const ssceCount = watch("ssceCount");
  React.useEffect(() => {
    const n = Number(ssceCount || 0);
    const current = getValues("exams");
    const base: ExamAttempt = {
      date: "",
      board: "WAEC",
      examNumber: "",
      subjects: [{ subject: "Mathematics", grade: "A1" }],
    };
    const next = Array.from({ length: n }, (_, i) => current[i] ?? base);
    replace(next);
  }, [ssceCount]); // eslint-disable-line

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
            SSCE Examinations
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Count */}
        <div className="mb-6">
          <label className="mb-2 block text-lg text-slate-700">
            No of SSCE taken
          </label>
          <div className="relative">
            <select
              {...register("ssceCount", { valueAsNumber: true })}
              className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              {[1, 2, 3].map((n) => (
                <option key={n} value={n as 1 | 2 | 3}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Render N exam sections (each with board & exam number) */}
        <div className="space-y-8">
          {examFields.map((f, idx) => (
            <div key={f.id} className="space-y-4">
              <div className="text-base font-semibold text-slate-900">
                SSCE {idx + 1}
              </div>

              {/* Date */}
              <div>
                <label className="mb-2 block text-lg text-slate-700">
                  Date taken (SSCE {idx + 1})
                </label>
                <input
                  type="month"
                  {...register(`exams.${idx}.date` as const, {
                    required: "Select date",
                  })}
                  className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                    (errors.exams?.[idx] as any)?.date
                      ? "border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                />
                <div className="min-h-5 pt-1 text-sm text-red-600">
                  {(errors.exams?.[idx] as any)?.date?.message as string}
                </div>
              </div>

              {/* Board */}
              <div>
                <label className="mb-2 block text-lg text-slate-700">
                  Exam board (SSCE {idx + 1})
                </label>
                <div className="relative">
                  <select
                    {...register(`exams.${idx}.board` as const)}
                    className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="WAEC">WAEC</option>
                    <option value="NECO">NECO</option>
                    <option value="GCE">GCE</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                </div>
              </div>

              {/* Exam number (per section) */}
              <div>
                <label className="mb-2 block text-lg text-slate-700">
                  Examination number (SSCE {idx + 1})
                </label>
                <input
                  {...register(`exams.${idx}.examNumber` as const, {
                    required: "Examination number is required",
                  })}
                  placeholder="e.g., 10CH020"
                  className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                    (errors.exams?.[idx] as any)?.examNumber
                      ? "border-red-400 focus:ring-red-100"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                  }`}
                />
                <div className="min-h-5 pt-1 text-sm text-red-600">
                  {(errors.exams?.[idx] as any)?.examNumber?.message as string}
                </div>
              </div>

              {/* Subjects for this SSCE */}
              <SubjectsForExam control={control} nestIndex={idx} />
            </div>
          ))}
        </div>

        {/* Score type (global) */}
        <div className="mt-8">
          <label className="mb-2 block text-lg text-slate-700">
            Score type
          </label>
          <div className="relative">
            <select
              {...register("scoreType")}
              className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
            >
              <option value="Letter">Letter grades (A1–F9)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-4 mt-8">
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

export default SSCEExamsRHF;
