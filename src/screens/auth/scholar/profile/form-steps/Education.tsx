// EducationRHF.tsx
import React, { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";

type YesNo = "Yes" | "No";
type SchoolType = "Single" | "Mixed" | "Boys" | "Girls";
type Qualification =
  | "Certificate"
  | "Diploma"
  | "Bachelor's"
  | "Master's"
  | "Doctoral";

type Level = {
  entryMonth: string; // YYYY-MM
  gradMonth?: string; // YYYY-MM
  ongoing: boolean;
  boarding: YesNo;
  schoolType: SchoolType;
  willGraduate: YesNo;
  graduateMonth?: string; // YYYY-MM
  // tertiary-only
  fieldOfStudy?: string;
  fieldOfStudyOther?: string; // NEW
  minQualification?: Qualification;
  gradeClassification?: string; // NEW
  gradeOther?: string; // NEW
  cgpa?: string; // NEW (text to allow 4.00 / 5.0 etc.)
};

type FormValues = {
  primary: Level;
  secondary: Level;
  tertiary: Level;
};

// Curated common fields; add/remove as you like.
// "Other" triggers a free-text box.
const FIELDS_OF_STUDY = [
  "Accounting",
  "Agricultural Science",
  "Business Administration",
  "Biology",
  "Chemistry",
  "Civil Engineering",
  "Computer Science",
  "Economics",
  "Electrical/Electronic Engineering",
  "Law",
  "Mass Communication",
  "Mechanical Engineering",
  "Medicine & Surgery",
  "Microbiology",
  "Nursing",
  "Physics",
  "Political Science",
  "Public Administration",
  "Sociology",
  "Statistics",
  "Other",
] as const;

// Grade / class options switch automatically by qualification
const GRADE_BY_QUAL: Record<Qualification, string[]> = {
  "Bachelor's": [
    "First Class",
    "Second Class Upper (2:1)",
    "Second Class Lower (2:2)",
    "Third Class",
    "Pass",
    "Other",
  ],
  Diploma: ["Distinction", "Upper Credit", "Lower Credit", "Pass", "Other"],
  Certificate: ["Distinction", "Merit", "Pass", "Other"],
  "Master's": ["Distinction", "Merit", "Pass", "Other"],
  Doctoral: ["Pass", "Other"], // Often unclassified; adjust as needed
};

const EducationRHF: React.FC<{
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
    setValue,
    // formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      primary: {
        entryMonth: "",
        gradMonth: "",
        ongoing: false,
        boarding: "Yes",
        schoolType: "Single",
        willGraduate: "Yes",
        graduateMonth: "",
      },
      secondary: {
        entryMonth: "",
        gradMonth: "",
        ongoing: false,
        boarding: "No",
        schoolType: "Mixed",
        willGraduate: "Yes",
        graduateMonth: "",
      },
      tertiary: {
        entryMonth: "",
        gradMonth: "",
        ongoing: false,
        boarding: "No",
        schoolType: "Mixed",
        willGraduate: "No",
        graduateMonth: "",
        fieldOfStudy: "",
        fieldOfStudyOther: "",
        minQualification: undefined as any,
        gradeClassification: "",
        gradeOther: "",
        cgpa: "",
      },
      ...initialData,
    },
    mode: "onTouched",
  });

  // collapsible sections
  const [open, setOpen] = useState<{ [k in keyof FormValues]: boolean }>({
    primary: true,
    secondary: false,
    tertiary: false,
  });

  const save = handleSubmit(async (v) => onSave?.(v));

  const SectionHeader: React.FC<{
    title: string;
    section: keyof FormValues;
  }> = ({ title, section }) => (
    <button
      type="button"
      onClick={() => setOpen((p) => ({ ...p, [section]: !p[section] }))}
      className="flex w-full items-center justify-between rounded-xl py-3 text-left"
      aria-expanded={open[section]}
    >
      <span className="text-2xl font-extrabold text-slate-900">{title}</span>
      <span
        className={`h-2.5 w-2.5 rounded-full ${
          open[section] ? "bg-[#2F56D9]" : "bg-slate-300"
        }`}
      />
    </button>
  );

  const Caret = () => (
    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
  );

  // watches for conditional UI
  const pOngoing = watch("primary.ongoing");
  const sOngoing = watch("secondary.ongoing");
  const tOngoing = watch("tertiary.ongoing");
  const pWillGrad = watch("primary.willGraduate");
  const sWillGrad = watch("secondary.willGraduate");
  const tWillGrad = watch("tertiary.willGraduate");

  const minQual = watch("tertiary.minQualification");
  const gradeSelected = watch("tertiary.gradeClassification");
  const fieldSelected = watch("tertiary.fieldOfStudy");

  // compute grade options based on selected qualification
  const gradeOptions = useMemo<string[]>(() => {
    if (!minQual) return [];
    return GRADE_BY_QUAL[minQual] ?? [];
  }, [minQual]);

  // reset grade if it no longer exists in current options
  React.useEffect(() => {
    if (!gradeOptions.length) {
      setValue("tertiary.gradeClassification", "");
      setValue("tertiary.gradeOther", "");
      return;
    }
    if (gradeSelected && !gradeOptions.includes(gradeSelected)) {
      setValue("tertiary.gradeClassification", "");
      setValue("tertiary.gradeOther", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gradeOptions]);

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
            Education
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Primary */}
        <SectionHeader title="Primary" section="primary" />
        {open.primary && (
          <div className="mt-2 space-y-5">
            {/* Date of Entry */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Date of entry
              </label>
              <input
                type="month"
                placeholder="May 2018"
                {...register("primary.entryMonth")}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            {/* Graduation date */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Graduation Date
              </label>
              <input
                type="month"
                {...register("primary.gradMonth")}
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                disabled={pOngoing}
              />
            </div>

            {/* Ongoing switch */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Ongoing
              </label>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  {...register("primary.ongoing")}
                  className="peer sr-only"
                />
                <div className="h-7 w-14 rounded-full bg-slate-300 transition peer-checked:bg-[#2F56D9]" />
                <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-7" />
              </label>
            </div>

            {/* Boarding */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Is it a boarding school
              </label>
              <div className="relative">
                <select
                  {...register("primary.boarding")}
                  className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
                <Caret />
              </div>
            </div>

            {/* Row: School type / Will graduate */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  School type
                </label>
                <div className="relative">
                  <select
                    {...register("primary.schoolType")}
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option>Single</option>
                    <option>Mixed</option>
                    <option>Boys</option>
                    <option>Girls</option>
                  </select>
                  <Caret />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Did or will you graduate from this school
                </label>
                <div className="relative">
                  <select
                    {...register("primary.willGraduate")}
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <Caret />
                </div>
              </div>
            </div>

            {/* Graduate date */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Graduate date
              </label>
              <div className="relative">
                <input
                  type="month"
                  {...register("primary.graduateMonth")}
                  disabled={pWillGrad === "No"}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        )}

        {/* Secondary */}
        <div className="mt-10">
          <SectionHeader title="Secondary" section="secondary" />
          {open.secondary && (
            <div className="mt-2 space-y-5">
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Date of entry
                </label>
                <input
                  type="month"
                  {...register("secondary.entryMonth")}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Graduation Date
                </label>
                <input
                  type="month"
                  {...register("secondary.gradMonth")}
                  disabled={sOngoing}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Ongoing
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    {...register("secondary.ongoing")}
                    className="peer sr-only"
                  />
                  <div className="h-7 w-14 rounded-full bg-slate-300 transition peer-checked:bg-[#2F56D9]" />
                  <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-7" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    School type
                  </label>
                  <div className="relative">
                    <select
                      {...register("secondary.schoolType")}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      <option>Mixed</option>
                      <option>Single</option>
                      <option>Boys</option>
                      <option>Girls</option>
                    </select>
                    <Caret />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Did or will you graduate from this school
                  </label>
                  <div className="relative">
                    <select
                      {...register("secondary.willGraduate")}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      <option>Yes</option>
                      <option>No</option>
                    </select>
                    <Caret />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Graduate date
                </label>
                <input
                  type="month"
                  {...register("secondary.graduateMonth")}
                  disabled={sWillGrad === "No"}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tertiary */}
        <div className="mt-10">
          <SectionHeader title="Tertiary" section="tertiary" />
          {open.tertiary && (
            <div className="mt-2 space-y-5">
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Date of entry
                </label>
                <input
                  type="month"
                  {...register("tertiary.entryMonth")}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Graduation Date
                </label>
                <input
                  type="month"
                  {...register("tertiary.gradMonth")}
                  disabled={tOngoing}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Ongoing
                </label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    {...register("tertiary.ongoing")}
                    className="peer sr-only"
                  />
                  <div className="h-7 w-14 rounded-full bg-slate-300 transition peer-checked:bg-[#2F56D9]" />
                  <span className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-7" />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* School type */}
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    School type
                  </label>
                  <div className="relative">
                    <select
                      {...register("tertiary.schoolType")}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      <option>Mixed</option>
                      <option>Single</option>
                      <option>Boys</option>
                      <option>Girls</option>
                    </select>
                    <Caret />
                  </div>
                </div>

                {/* Field of study (Dropdown + Other) */}
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Field of study
                  </label>
                  <div className="relative">
                    <select
                      {...register("tertiary.fieldOfStudy")}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    >
                      <option value="">Select</option>
                      {FIELDS_OF_STUDY.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                    <Caret />
                  </div>
                  {fieldSelected === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter field of study"
                      {...register("tertiary.fieldOfStudyOther")}
                      className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                  )}
                </div>
              </div>

              {/* Minimum qualification */}
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Minimum qualification
                </label>
                <div className="relative">
                  <select
                    {...register("tertiary.minQualification")}
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option value="">Select</option>
                    <option>Certificate</option>
                    <option>Diploma</option>
                    <option>Bachelor's</option>
                    <option>Master's</option>
                    <option>Doctoral</option>
                  </select>
                  <Caret />
                </div>
              </div>

              {/* Grade / Classification (auto options) + Other */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Grade / Classification
                  </label>
                  <div className="relative">
                    <select
                      {...register("tertiary.gradeClassification")}
                      disabled={!minQual}
                      className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                    >
                      <option value="">Select</option>
                      {gradeOptions.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                    <Caret />
                  </div>
                  {gradeSelected === "Other" && (
                    <input
                      type="text"
                      placeholder="Enter grade/classification"
                      {...register("tertiary.gradeOther")}
                      className="mt-2 h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                    />
                  )}
                </div>

                {/* CGPA */}
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    CGPA (e.g., 3.45/5.0 or 4.10/4.0)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 4.21 / 5.0"
                    {...register("tertiary.cgpa")}
                    className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* Did/will graduate */}
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Did or will you graduate from this school
                </label>
                <div className="relative">
                  <select
                    {...register("tertiary.willGraduate")}
                    className="h-14 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  >
                    <option>Yes</option>
                    <option>No</option>
                  </select>
                  <Caret />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Graduate date
                </label>
                <input
                  type="month"
                  {...register("tertiary.graduateMonth")}
                  disabled={tWillGrad === "No"}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:opacity-60"
                />
              </div>
            </div>
          )}
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

export default EducationRHF;
