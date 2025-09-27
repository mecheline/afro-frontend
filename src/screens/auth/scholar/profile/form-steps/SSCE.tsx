// SSCEExamsRHF.tsx
import React, { useEffect } from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type Control,
} from "react-hook-form";
import Select from "react-select";
import { ArrowLeft, Plus } from "lucide-react";

/* ---------- Types ---------- */
type MonthStr = string; // "2021-07"

type SubjectRow = { subject: string; grade: string };
type ExamAttempt = {
  date: MonthStr;
  board: "WAEC" | "NECO" | "GCE";
  examNumber: string; // per-section exam number
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

type Opt<T extends string | number = string> = { value: T; label: string };
const toOpts = <T extends string | number>(arr: readonly T[]): Opt<T>[] =>
  arr.map((v) => ({ value: v, label: String(v) }));

const COUNT_OPTS = toOpts([1, 2, 3]);
const BOARD_OPTS = toOpts<"WAEC" | "NECO" | "GCE">(["WAEC", "NECO", "GCE"]);
const SUBJECT_OPTS = toOpts(SUBJECTS);
const GRADE_OPTS = toOpts(GRADES);
const SCORE_TYPE_OPTS: Opt<"Letter">[] = [
  { value: "Letter", label: "Letter grades (A1–F9)" },
];

/** Shared react-select styles */
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 48,
    borderRadius: 16,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "#f8fafc",
    ":hover": { borderColor: state.isFocused ? "#6366f1" : "#e2e8f0" },
  }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isDisabled ? "#9CA3AF" : "#111827",
    backgroundColor: state.isSelected
      ? "#E0E7FF"
      : state.isFocused
      ? "#EEF2FF"
      : "white",
  }),
  singleValue: (base: any) => ({ ...base, color: "#111827" }),
  input: (base: any) => ({ ...base, color: "#111827" }),
  placeholder: (base: any) => ({ ...base, color: "#6B7280" }),
  menu: (base: any) => ({ ...base, zIndex: 30 }),
  valueContainer: (base: any) => ({ ...base, padding: "0 12px" }),
};

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
        Subjects &amp; Scores (SSCE {nestIndex + 1})
      </div>

      {fields.map((row, i) => (
        <div key={row.id} className="mb-3 grid gap-4 sm:grid-cols-2">
          {/* Subject */}
          <div>
            <label className="mb-2 block text-sm text-slate-700">
              Subject {i + 1}
            </label>
            <Controller
              control={control}
              name={`exams.${nestIndex}.subjects.${i}.subject` as const}
              render={({ field }) => (
                <Select
                  instanceId={`subject-${nestIndex}-${i}`}
                  styles={selectStyles}
                  isSearchable
                  isClearable={false}
                  options={SUBJECT_OPTS}
                  value={
                    SUBJECT_OPTS.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) =>
                    field.onChange((opt?.value as string) ?? "")
                  }
                  placeholder="Select subject"
                />
              )}
            />
          </div>

          {/* Grade */}
          <div>
            <label className="mb-2 block text-sm text-slate-700">Score</label>
            <Controller
              control={control}
              name={`exams.${nestIndex}.subjects.${i}.grade` as const}
              render={({ field }) => (
                <Select
                  instanceId={`grade-${nestIndex}-${i}`}
                  styles={selectStyles}
                  isSearchable
                  isClearable={false}
                  options={GRADE_OPTS}
                  value={
                    GRADE_OPTS.find((o) => o.value === field.value) ?? null
                  }
                  onChange={(opt) =>
                    field.onChange((opt?.value as string) ?? "")
                  }
                  placeholder="Select grade"
                />
              )}
            />
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
  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ssceCount]);

  const submit = handleSubmit(async (v) => onSave?.(v));

  return (
    <div className="min-h-screen">
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
          <Controller
            control={control}
            name="ssceCount"
            render={({ field }) => (
              <Select
                instanceId="ssceCount"
                styles={selectStyles}
                isSearchable={false}
                isClearable={false}
                options={COUNT_OPTS}
                value={COUNT_OPTS.find((o) => o.value === field.value) ?? null}
                onChange={(opt) =>
                  field.onChange((opt?.value as 1 | 2 | 3) ?? 1)
                }
                placeholder="Select count"
              />
            )}
          />
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
                <Controller
                  control={control}
                  name={`exams.${idx}.board` as const}
                  render={({ field }) => (
                    <Select
                      instanceId={`board-${idx}`}
                      styles={selectStyles}
                      isSearchable
                      isClearable={false}
                      options={BOARD_OPTS}
                      value={
                        BOARD_OPTS.find((o) => o.value === field.value) ?? null
                      }
                      onChange={(opt) =>
                        field.onChange(
                          (opt?.value as "WAEC" | "NECO" | "GCE") ?? "WAEC"
                        )
                      }
                      placeholder="Select board"
                    />
                  )}
                />
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
          <Controller
            control={control}
            name="scoreType"
            render={({ field }) => (
              <Select
                instanceId="scoreType"
                styles={selectStyles}
                isSearchable={false}
                isClearable={false}
                options={SCORE_TYPE_OPTS}
                value={
                  SCORE_TYPE_OPTS.find((o) => o.value === field.value) ?? null
                }
                onChange={(opt) =>
                  field.onChange((opt?.value as "Letter") ?? "Letter")
                }
                placeholder="Select"
              />
            )}
          />
        </div>

        <div className="mx-auto grid w/full max-w-xl grid-cols-2 gap-4 mt-8">
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
