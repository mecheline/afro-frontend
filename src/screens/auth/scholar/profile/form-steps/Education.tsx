// EducationRHF.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useLazyGetFieldsQuery } from "../../../../../redux/services/scholar/api";

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
  // legacy text field (kept for backward compatibility)
  fieldOfStudy?: string;

  // Catalog-powered fields
  fieldOfStudyKey?: string; // canonical key (for matching)
  fieldOfStudyLabel?: string; // canonical label
  fieldOfStudyVariant?: string; // the exact variant the scholar picked

  minQualification?: Qualification | "";
  gradeClassification?: string;
  cgpa?: string;
};

type FormValues = {
  primary: Level;
  secondary: Level;
  tertiary: Level;
};

/** ---------- Grade options ---------- */
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

/** ---------- react-select helpers ---------- */
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

export const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 56,
    borderRadius: 8,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "white",
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

const findOpt = <T extends string>(opts: Opt<T>[], value?: T | "") =>
  opts.find((o) => o.value === (value ?? "")) ?? null;

const useDebounced = (value: string, ms = 300) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
};

const EducationRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  /** form first */
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
          // legacy
          fieldOfStudy: "",
          // catalog-powered
          fieldOfStudyKey: "",
          fieldOfStudyLabel: "",
          fieldOfStudyVariant: "",
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

  const SectionHeader: React.FC<{
    title: string;
    section: keyof FormValues;
  }> = ({ title, section }) => {
    const isOpen = open[section];
    return (
      <button
        type="button"
        onClick={() => setOpen((p) => ({ ...p, [section]: !p[section] }))}
        className="flex w-full items-center border border-gray-200 px-2 mt-6 justify-between rounded-xl py-3 text-left"
        aria-expanded={isOpen}
        aria-controls={`${section}-panel`}
      >
        <span className="text-xl">{title}</span>
        <ChevronDown
          className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>
    );
  };

  /** watches */
  const pOngoing = watch("primary.ongoing");
  const sOngoing = watch("secondary.ongoing");
  const tOngoing = watch("tertiary.ongoing");
  const pWillGrad = watch("primary.willGraduate");
  const sWillGrad = watch("secondary.willGraduate");
  const tWillGrad = watch("tertiary.willGraduate");
  const minQual = watch("tertiary.minQualification");
  const currentGrade = watch("tertiary.gradeClassification");

  /** ---------------- Field of Study: show VARIANTS to scholars ---------------- */
  const [triggerGetFields, { data: fieldRows, isFetching }] =
    useLazyGetFieldsQuery();
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 300);

  // Build: options from variants; also map key->label so we can store canonical label
  type VariantOpt = Opt<string> & { metaKey?: string; metaLabel?: string };
  const [fosOptions, setFosOptions] = useState<VariantOpt[]>([
    { value: "", label: "Select" },
  ]);

  useEffect(() => {
    triggerGetFields({ q: debounced || undefined });
  }, [debounced, triggerGetFields]);

  useEffect(() => {
    // fieldRows: [{ key, label, parentKey, variants? }]
    const byKeyLabel = new Map<string, string>();
    const next: VariantOpt[] = [{ value: "", label: "Select" }];

    (fieldRows ?? []).forEach((row: any) => {
      const key: string = row.key;
      const canonicalLabel: string = row.label;
      byKeyLabel.set(key, canonicalLabel);

      // Make unique, human-friendly visible options out of variants.
      // If no variants, include the canonical label as the visible option.
      const vis =
        Array.isArray(row.variants) && row.variants.length > 0
          ? row.variants
          : [canonicalLabel];

      vis.forEach((variant: string) => {
        const trimmed = (variant || "").trim();
        if (!trimmed) return;
        next.push({
          value: key,
          label: trimmed,
          metaKey: key,
          metaLabel: canonicalLabel,
        });
      });
    });

    // Keep any previously saved selection present (e.g., when search is filtered out)
    const savedKey = getValues("tertiary.fieldOfStudyKey") || "";
    const savedVariant = getValues("tertiary.fieldOfStudyVariant") || "";
    const savedLabel =
      getValues("tertiary.fieldOfStudyLabel") ||
      (savedKey ? byKeyLabel.get(savedKey) || "" : "");

    const exists =
      savedKey &&
      savedVariant &&
      next.some(
        (o) =>
          o.value === savedKey &&
          o.label.toLowerCase() === savedVariant.toLowerCase()
      );

    setFosOptions(
      exists || !savedVariant
        ? next
        : [
            ...next,
            {
              value: savedKey,
              label: savedVariant,
              metaKey: savedKey,
              metaLabel: savedLabel,
            },
          ]
    );
  }, [fieldRows, getValues]);

  /** ---------------- Grade options (depend on qualification) ---------------- */
  const [gradeOptions, setGradeOptions] = useState<Opt<string>[]>(() => {
    const initQual =
      (initialData?.tertiary?.minQualification as
        | Qualification
        | ""
        | undefined) || "";
    const initGrade = initialData?.tertiary?.gradeClassification ?? "";
    if (!initQual) return [{ value: "", label: "Select" }];
    const base = GRADE_BY_QUAL[initQual as Qualification] ?? [];
    const opts = [{ value: "", label: "Select" }, ...toOpts(base)];
    return initGrade && !opts.some((o) => o.value === initGrade)
      ? [...opts, { value: initGrade, label: initGrade }]
      : opts;
  });

  useEffect(() => {
    const currentQual = (minQual as Qualification | "" | undefined) || "";
    const current = currentGrade ?? "";

    if (!currentQual) {
      setGradeOptions([{ value: "", label: "Select" }]);
      if (current) setValue("tertiary.gradeClassification", "");
      return;
    }

    const base = GRADE_BY_QUAL[currentQual] ?? [];
    let next = [{ value: "", label: "Select" }, ...toOpts(base)];
    if (current && !["", ...base].includes(current)) {
      next = [...next, { value: current, label: current }];
    }
    setGradeOptions(next);
  }, [minQual, currentGrade, setValue]);

  /** Creatable handlers */
  const handleCreateFieldOfStudy = (input: string) => {
    const custom = (input || "").trim();
    if (!custom) return;

    // Custom has no canonical key. We store variant & label as the string, key as empty.
    const opt: VariantOpt = { value: "", label: custom };
    setFosOptions((prev) => [...prev, opt]);

    setValue("tertiary.fieldOfStudyKey", "", {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("tertiary.fieldOfStudyLabel", custom, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("tertiary.fieldOfStudyVariant", custom, {
      shouldDirty: true,
      shouldTouch: true,
    });
    setValue("tertiary.fieldOfStudy", custom, {
      shouldDirty: true,
      shouldTouch: true,
    }); // legacy
  };

  const handleCreateGrade = (input: string) => {
    const custom = (input || "").trim();
    if (!custom) return;
    const opt = { value: custom, label: custom };
    setGradeOptions((prev) => [...prev, opt]);
    setValue("tertiary.gradeClassification", custom, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  /** sync initialData once (if it changes) */
  useEffect(() => {
    const key = initialData?.tertiary?.fieldOfStudyKey || "";
    const label = initialData?.tertiary?.fieldOfStudyLabel || "";
    const variant =
      initialData?.tertiary?.fieldOfStudyVariant ||
      label ||
      initialData?.tertiary?.fieldOfStudy ||
      "";

    if (
      variant &&
      !fosOptions.some(
        (o) =>
          o.value === key && o.label.toLowerCase() === variant.toLowerCase()
      )
    ) {
      setFosOptions((prev) => [
        ...prev,
        { value: key, label: variant, metaKey: key, metaLabel: label },
      ]);
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
        grade && !baseOpts.some((o) => o.value === grade)
          ? [...baseOpts, { value: grade, label: grade }]
          : baseOpts;
      setGradeOptions(withCustom);
    }
  }, [initialData]); // only when prop updates

  /** actions */
  const save = handleSubmit(async (v) => {
    // maintain a sensible legacy value for fieldOfStudy (display text)
    if (!v.tertiary.fieldOfStudy) {
      v.tertiary.fieldOfStudy =
        v.tertiary.fieldOfStudyVariant || v.tertiary.fieldOfStudyLabel || "";
    }
    onSave?.(v);
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="headerTitle"
        >
          <ArrowLeft className="h-6 w-6 " />
          <span className="text-2xl font-extrabold">Education</span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
        {/* Primary */}
        <SectionHeader title="Primary" section="primary" />
        {open.primary && (
          <div className="mt-2 space-y-5">
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Date of entry
              </label>
              <input
                type="month"
                placeholder="May 2018"
                {...register("primary.entryMonth")}
                className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-base text-slate-700">
                Graduation Date
              </label>
              <input
                type="month"
                {...register("primary.gradMonth")}
                className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
                disabled={pOngoing}
              />
            </div>

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

            <div>
              <label className="mb-2 block text-base text-slate-700">
                Graduate date
              </label>
              <div className="relative">
                <input
                  type="month"
                  {...register("primary.graduateMonth")}
                  disabled={pWillGrad === "No"}
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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

                {/* Field of study — show VARIANTS as labels */}
                <div>
                  <label className="mb-2 block text-base text-slate-700">
                    Field of study
                  </label>
                  <Controller
                    control={control}
                    name="tertiary.fieldOfStudyKey"
                    render={({ field }) => (
                      <CreatableSelect
                        instanceId="tertiary-fieldOfStudy"
                        isSearchable
                        isClearable
                        styles={selectStyles}
                        options={fosOptions}
                        isLoading={isFetching}
                        value={
                          // pick the option that matches both key & saved variant (best UX),
                          // else fall back to any option with that key.
                          fosOptions.find(
                            (o) =>
                              o.value === (field.value ?? "") &&
                              o.label.toLowerCase() ===
                                (
                                  getValues("tertiary.fieldOfStudyVariant") ||
                                  ""
                                ).toLowerCase()
                          ) ||
                          fosOptions.find(
                            (o) => o.value === (field.value ?? "")
                          ) ||
                          null
                        }
                        onChange={(opt) => {
                          const key = (opt?.value as string) ?? "";
                          const chosenVariant = opt?.label ?? "";
                          // Find canonical label from the matched option (metaLabel) or fallback by looking up
                          const canonicalLabel =
                            (opt as any)?.metaLabel ||
                            (fieldRows ?? []).find((r: any) => r.key === key)
                              ?.label ||
                            "";

                          field.onChange(key);
                          setValue(
                            "tertiary.fieldOfStudyVariant",
                            chosenVariant,
                            { shouldDirty: true }
                          );
                          setValue(
                            "tertiary.fieldOfStudyLabel",
                            canonicalLabel,
                            { shouldDirty: true }
                          );
                          // legacy text for display elsewhere
                          setValue(
                            "tertiary.fieldOfStudy",
                            chosenVariant || canonicalLabel,
                            { shouldDirty: true }
                          );
                        }}
                        onInputChange={(input, meta) => {
                          if (meta.action === "input-change") setSearch(input);
                        }}
                        onCreateOption={handleCreateFieldOfStudy}
                        placeholder="Search (e.g., 'comp sci', 'EEE', 'mass comm')…"
                      />
                    )}
                  />
                  {/* keep hidden fields in the form state */}
                  <input
                    type="hidden"
                    {...register("tertiary.fieldOfStudyLabel")}
                  />
                  <input
                    type="hidden"
                    {...register("tertiary.fieldOfStudyVariant")}
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

              {/* Grade / Classification */}
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
                    className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
                  className="textInput h-14 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
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
