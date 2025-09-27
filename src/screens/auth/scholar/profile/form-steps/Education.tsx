// EducationRHF.tsx
import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ArrowLeft, ChevronDown } from "lucide-react";

/** ---------- Types ---------- */
type YesNo = "Yes" | "No";
type SchoolType = "Single" | "Mixed" | "Boys" | "Girls";
type Qualification =
  | "Certificate"
  | "Diploma"
  | "Bachelors"
  | "Masters"
  | "Doctorate";

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
  minQualification?: Qualification | "";
  gradeClassification?: string;
  cgpa?: string;
};

type FormValues = {
  primary: Level;
  secondary: Level;
  tertiary: Level;
};

/** ---------- Constants ---------- */
const FIELDS_OF_STUDY = [
  "Accounting",
  "Agricultural Science",
  "Architecture",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Criminology",
  "Data Science",
  "Dentistry",
  "Economics",
  "Education",
  "Electrical/Electronic Engineering",
  "English",
  "Environmental Science",
  "Finance",
  "Geography",
  "Geology",
  "History",
  "Human Resource Management",
  "Information Systems",
  "Information Technology",
  "International Relations",
  "Law",
  "Linguistics",
  "Management",
  "Marketing",
  "Mass Communication",
  "Mathematics",
  "Mechanical Engineering",
  "Mechatronics",
  "Medicine & Surgery",
  "Microbiology",
  "Nursing",
  "Petroleum Engineering",
  "Pharmacy",
  "Philosophy",
  "Physics",
  "Physiology",
  "Political Science",
  "Project Management",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Quantity Surveying",
  "Sociology",
  "Software Engineering",
  "Statistics",
  "Theatre Arts",
  "Urban & Regional Planning",
] as const;

const GRADE_BY_QUAL: Record<Qualification, string[]> = {
  Bachelors: [
    "First Class",
    "Second Class Upper (2:1)",
    "Second Class Lower (2:2)",
    "Third Class",
    "Pass",

  ],
  Diploma: ["Distinction", "Upper Credit", "Lower Credit", "Pass"],
  Certificate: ["Distinction", "Merit", "Pass"],
  Masters: ["Distinction", "Merit", "Pass"],
  Doctorate: ["Pass"],
};

/** react-select option helpers */
type Opt<T extends string = string> = { value: T; label: string };
const toOpts = <T extends string>(arr: readonly T[] | T[]): Opt<T>[] =>
  arr.map((v) => ({ value: v, label: v }));

const YES_NO_OPTS = toOpts<YesNo>(["Yes", "No"]);
const SCHOOL_TYPE_OPTS = toOpts<SchoolType>([
  "Single",
  "Mixed",
  "Boys",
  "Girls",
]);
const QUAL_OPTS: Opt<Qualification | "">[] = [
  { value: "", label: "Select" },
  ...toOpts<Qualification>([
    "Certificate",
    "Diploma",
    "Bachelors",
    "Masters",
    "Doctorate",
  ]),
];

/** Common select styles (visible text, height, rounded) */
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 56,
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

/** helper */
const findOpt = <T extends string>(opts: Opt<T>[], value?: T | "") =>
  opts.find((o) => o.value === (value ?? "")) ?? null;

const EducationRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const { register, handleSubmit, getValues, watch, setValue, control } =
    useForm<FormValues>({
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
          minQualification: "",
          gradeClassification: "",
          cgpa: "",
        },
        ...initialData,
      },
      mode: "onTouched",
    });

  /** collapsible sections */
  const [open, setOpen] = useState<{ [k in keyof FormValues]: boolean }>({
    primary: true,
    secondary: false,
    tertiary: false,
  });

  const save = handleSubmit(async (v) => onSave?.(v));

  const SectionHeader: React.FC<{
    title: string;
    section: keyof FormValues;
  }> = ({ title, section }) => {
    const isOpen = open[section];
    return (
      <button
        type="button"
        onClick={() => setOpen((p) => ({ ...p, [section]: !p[section] }))}
        className="flex w-full items-center justify-between rounded-xl py-3 text-left"
        aria-expanded={isOpen}
        aria-controls={`${section}-panel`}
      >
        <span className="text-2xl font-extrabold text-slate-900">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    );
  };

  /** watches for conditional UI */
  const pOngoing = watch("primary.ongoing");
  const sOngoing = watch("secondary.ongoing");
  const tOngoing = watch("tertiary.ongoing");
  const pWillGrad = watch("primary.willGraduate");
  const sWillGrad = watch("secondary.willGraduate");
  const tWillGrad = watch("tertiary.willGraduate");

  const minQual = watch("tertiary.minQualification"); // string | ""
  const currentGrade = watch("tertiary.gradeClassification"); // string | ""

  /** Local option state for creatable fields */
  /* const [fosOptions, setFosOptions] = useState<Opt<string>[]>([
    { value: "", label: "Select" },
    ...toOpts(FIELDS_OF_STUDY),
  ]); */

  
  const toOpt = (v: string) => ({ value: v, label: v });
  const hasVal = (opts: { value: string }[], v?: string) =>
    !!v && opts.some((o) => o.value === v);

  const [fosOptions, setFosOptions] = useState<Opt<string>[]>(() => {
    const base = [{ value: "", label: "Select" }, ...toOpts(FIELDS_OF_STUDY)];
    const init = initialData?.tertiary?.fieldOfStudy ?? "";
    // If the saved value isn't in the list, append it so CreatableSelect can show it.
    return init && !hasVal(base, init) ? [...base, toOpt(init)] : base;
  });

/*   const [gradeOptions, setGradeOptions] = useState<Opt<string>[]>([
    { value: "", label: "Select" },
  ]); */

  const [gradeOptions, setGradeOptions] = useState<Opt<string>[]>(() => {
    const initQual = initialData?.tertiary?.minQualification as
      | Qualification
      | ""
      | undefined;
    const initGrade = initialData?.tertiary?.gradeClassification ?? "";

    if (!initQual) return [{ value: "", label: "Select" }];

    const base = GRADE_BY_QUAL[initQual as Qualification] ?? [];
    const opts = [{ value: "", label: "Select" }, ...toOpts(base)];
    // If saved grade was user-created and not in base, add it so it pre-fills.
    return initGrade && !hasVal(opts, initGrade)
      ? [...opts, toOpt(initGrade)]
      : opts;
  });


  /** Recompute grade options when qualification changes */
  /* useEffect(() => {
    if (!minQual) {
      setGradeOptions([{ value: "", label: "Select" }]);
      return;
    }
    const base = GRADE_BY_QUAL[minQual as Qualification] ?? [];
    const next = [{ value: "", label: "Select" }, ...toOpts(base)];
    setGradeOptions(next);

    if (currentGrade && !["", ...base].includes(currentGrade)) {
      setValue("tertiary.gradeClassification", "");
    }
   
  }, [minQual]); */

  useEffect(() => {
    const currentQual = minQual as Qualification | "" | undefined;
    const current = currentGrade ?? "";

    if (!currentQual) {
      setGradeOptions([{ value: "", label: "Select" }]);
      // Clear the grade since there is no qual selected
      if (current) setValue("tertiary.gradeClassification", "");
      return;
    }

    const base = GRADE_BY_QUAL[currentQual] ?? [];
    let next = [{ value: "", label: "Select" }, ...toOpts(base)];

    // If there's a saved/custom grade not in base, include it so CreatableSelect can display it.
    if (current && !["", ...base].includes(current)) {
      next = [...next, toOpt(current)];
    }
    setGradeOptions(next);

    // Optional: if you *must* reset invalid grades on qual change, uncomment:
    // if (current && !["", ...base].includes(current)) setValue("tertiary.gradeClassification", "");
  }, [minQual, currentGrade, setValue]);


  /** Creatable handlers */
  const handleCreateFieldOfStudy = (input: string) => {
    const opt = { value: input, label: input };
    setFosOptions((prev) => [...prev, opt]);
    setValue("tertiary.fieldOfStudy", input, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const handleCreateGrade = (input: string) => {
    const opt = { value: input, label: input };
    setGradeOptions((prev) => [...prev, opt]);
    setValue("tertiary.gradeClassification", input, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };



  useEffect(() => {
    const fos = initialData?.tertiary?.fieldOfStudy ?? "";
    if (fos && !hasVal(fosOptions, fos)) {
      setFosOptions((prev) => [...prev, toOpt(fos)]);
    }

    const qual = initialData?.tertiary?.minQualification as
      | Qualification
      | ""
      | undefined;
    const grade = initialData?.tertiary?.gradeClassification ?? "";
    if (qual) {
      const base = GRADE_BY_QUAL[qual] ?? [];
      const baseOpts = [{ value: "", label: "Select" }, ...toOpts(base)];
      const withCustom =
        grade && !hasVal(baseOpts, grade)
          ? [...baseOpts, toOpt(grade)]
          : baseOpts;
      setGradeOptions(withCustom);
    }
  }, [initialData]); // runs if the prop updates

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
            Education
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
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
              <Controller
                control={control}
                name="primary.boarding"
                render={({ field }) => (
                  <Select
                    instanceId="primary-boarding"
                    isSearchable
                    isClearable
                    styles={selectStyles}
                    options={YES_NO_OPTS}
                    value={findOpt(YES_NO_OPTS, field.value)}
                    onChange={(opt) =>
                      field.onChange((opt?.value as YesNo) ?? "")
                    }
                    placeholder="Select"
                  />
                )}
              />
            </div>

            {/* Row: School type / Will graduate */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  School type
                </label>
                <Controller
                  control={control}
                  name="primary.schoolType"
                  render={({ field }) => (
                    <Select
                      instanceId="primary-schoolType"
                      isSearchable
                      isClearable
                      styles={selectStyles}
                      options={SCHOOL_TYPE_OPTS}
                      value={findOpt(SCHOOL_TYPE_OPTS, field.value)}
                      onChange={(opt) =>
                        field.onChange((opt?.value as SchoolType) ?? "")
                      }
                      placeholder="Select"
                    />
                  )}
                />
              </div>

              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Did or will you graduate from this school
                </label>
                <Controller
                  control={control}
                  name="primary.willGraduate"
                  render={({ field }) => (
                    <Select
                      instanceId="primary-willGraduate"
                      isSearchable
                      isClearable
                      styles={selectStyles}
                      options={YES_NO_OPTS}
                      value={findOpt(YES_NO_OPTS, field.value)}
                      onChange={(opt) =>
                        field.onChange((opt?.value as YesNo) ?? "")
                      }
                      placeholder="Select"
                    />
                  )}
                />
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
                  <Controller
                    control={control}
                    name="secondary.schoolType"
                    render={({ field }) => (
                      <Select
                        instanceId="secondary-schoolType"
                        isSearchable
                        isClearable
                        styles={selectStyles}
                        options={SCHOOL_TYPE_OPTS}
                        value={findOpt(SCHOOL_TYPE_OPTS, field.value)}
                        onChange={(opt) =>
                          field.onChange((opt?.value as SchoolType) ?? "")
                        }
                        placeholder="Select"
                      />
                    )}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Did or will you graduate from this school
                  </label>
                  <Controller
                    control={control}
                    name="secondary.willGraduate"
                    render={({ field }) => (
                      <Select
                        instanceId="secondary-willGraduate"
                        isSearchable
                        isClearable
                        styles={selectStyles}
                        options={YES_NO_OPTS}
                        value={findOpt(YES_NO_OPTS, field.value)}
                        onChange={(opt) =>
                          field.onChange((opt?.value as YesNo) ?? "")
                        }
                        placeholder="Select"
                      />
                    )}
                  />
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
                  <Controller
                    control={control}
                    name="tertiary.schoolType"
                    render={({ field }) => (
                      <Select
                        instanceId="tertiary-schoolType"
                        isSearchable
                        isClearable
                        styles={selectStyles}
                        options={SCHOOL_TYPE_OPTS}
                        value={findOpt(SCHOOL_TYPE_OPTS, field.value)}
                        onChange={(opt) =>
                          field.onChange((opt?.value as SchoolType) ?? "")
                        }
                        placeholder="Select"
                      />
                    )}
                  />
                </div>

                {/* Field of study (Creatable) */}
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Field of study
                  </label>
                  <Controller
                    control={control}
                    name="tertiary.fieldOfStudy"
                    render={({ field }) => (
                      <CreatableSelect
                        instanceId="tertiary-fieldOfStudy"
                        isSearchable
                        isClearable
                        styles={selectStyles}
                        options={fosOptions}
                        value={
                          fosOptions.find(
                            (o) => o.value === (field.value ?? "")
                          ) ?? null
                        }
                        onChange={(opt) =>
                          field.onChange((opt?.value as string) ?? "")
                        }
                        onCreateOption={handleCreateFieldOfStudy}
                        placeholder="Select or type to add…"
                      />
                    )}
                  />
                </div>
              </div>

              {/* Minimum qualification */}
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Minimum qualification
                </label>
                <Controller
                  control={control}
                  name="tertiary.minQualification"
                  render={({ field }) => (
                    <Select
                      instanceId="tertiary-minQualification"
                      isSearchable
                      isClearable
                      styles={selectStyles}
                      options={QUAL_OPTS}
                      value={findOpt(QUAL_OPTS, field.value ?? "")}
                      onChange={(opt) => {
                        field.onChange(
                          (opt?.value as Qualification | "") ?? ""
                        );
                        setValue("tertiary.gradeClassification", "");
                      }}
                      placeholder="Select"
                    />
                  )}
                />
              </div>

              {/* Grade / Classification (Creatable, depends on qualification) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Grade / Classification
                  </label>
                  <Controller
                    control={control}
                    name="tertiary.gradeClassification"
                    render={({ field }) => (
                      <CreatableSelect
                        instanceId="tertiary-gradeClassification"
                        isSearchable
                        isClearable
                        isDisabled={!minQual}
                        styles={selectStyles}
                        options={gradeOptions}
                        value={
                          gradeOptions.find(
                            (o) => o.value === (field.value ?? "")
                          ) ?? null
                        }
                        onChange={(opt) =>
                          field.onChange((opt?.value as string) ?? "")
                        }
                        onCreateOption={handleCreateGrade}
                        placeholder={
                          minQual
                            ? "Select or type to add…"
                            : "Select qualification first"
                        }
                      />
                    )}
                  />
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
                <Controller
                  control={control}
                  name="tertiary.willGraduate"
                  render={({ field }) => (
                    <Select
                      instanceId="tertiary-willGraduate"
                      isSearchable
                      isClearable
                      styles={selectStyles}
                      options={YES_NO_OPTS}
                      value={findOpt(YES_NO_OPTS, field.value)}
                      onChange={(opt) =>
                        field.onChange((opt?.value as YesNo) ?? "")
                      }
                      placeholder="Select"
                    />
                  )}
                />
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

        {/* Footer buttons */}
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
