// ParentRHF.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import moment from "moment";

/** ---------- Types ---------- */
type YesNo = "Yes" | "No";

type ParentBlock = {
  // top section
  parentType: "Married" | "Single" | "Separated" | "Divorced" | "Widowed";
  living: YesNo;
  prefix: "Mr" | "Mrs" | "Ms" | "Dr" | "Prof";
  firstName: string;
  middleName?: string;
  lastName: string;
  formerLastName?: string;
  suffix?: "-" | "Jr." | "Sr." | "I" | "II" | "III" | "IV" | "V";

  // contacts / work
  email?: string;
  phone?: string;
  occupation?: string;
  employmentStatus?: "Employed" | "Unemployed" | "Self-employed" | "Retired";
  currentlyEmployed?: YesNo;
  income?:
    | "Below ₦100k"
    | "₦100k-₦200k"
    | "₦200k-₦400k"
    | "₦500k-₦1m"
    | "Above ₦1m";

  // education
  highestQualification?:
    | "Primary"
    | "Secondary"
    | "Diploma"
    | "Graduate"
    | "Postgraduate";
  institutionsCount?: string;
  degreeReceived?: string; // free text or list
  dateOfBirth?: string;
};

type FormValues = {
  parent1: ParentBlock;
  parent2: ParentBlock;
};

/** ---------- Options ---------- */
const PARENT_TYPE: ParentBlock["parentType"][] = [
  "Married",
  "Single",
  "Separated",
  "Divorced",
  "Widowed",
];

const PREFIX: ParentBlock["prefix"][] = ["Mr", "Mrs", "Ms", "Dr", "Prof"];

const SUFFIX: NonNullable<ParentBlock["suffix"]>[] = [
  "-",
  "Jr.",
  "Sr.",
  "I",
  "II",
  "III",
  "IV",
  "V",
];

const EMPLOYMENT: NonNullable<ParentBlock["employmentStatus"]>[] = [
  "Employed",
  "Unemployed",
  "Self-employed",
  "Retired",
];

const INCOME: NonNullable<ParentBlock["income"]>[] = [
  "Below ₦100k",
  "₦100k-₦200k",
  "₦200k-₦400k",
  "₦500k-₦1m",
  "Above ₦1m",
];

const QUALS: NonNullable<ParentBlock["highestQualification"]>[] = [
  "Primary",
  "Secondary",
  "Diploma",
  "Graduate",
  "Postgraduate",
];

/** ---------- react-select helpers/styles ---------- */
type Opt<T extends string = string> = { value: T; label: string };
const toOpts = <T extends string>(arr: readonly T[] | T[]): Opt<T>[] =>
  arr.map((v) => ({ value: v, label: v }));
const findOpt = <T extends string>(opts: Opt<T>[], v?: T | "") =>
  opts.find((o) => o.value === (v ?? "")) ?? null;

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 48,
    borderRadius: 8,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "#fff",
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

/** ---------- Small helpers ---------- */
const Label: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <label className={`mb-2 block text-sm text-slate-600 ${className}`}>
    {children}
  </label>
);

const FieldError: React.FC<{ message?: string }> = ({ message }) => (
  <div className="min-h-5 mt-1 flex items-center gap-1 text-xs text-red-600">
    {message ? (
      <>
        <AlertCircle className="h-3.5 w-3.5" />
        <span>{message}</span>
      </>
    ) : null}
  </div>
);

/** ---------- Reusable group ---------- */
function ParentSection({
  register,
  control,
  errors,
  path,
  title,
  open,
  onToggle,
}: {
  register: ReturnType<typeof useForm<FormValues>>["register"];
  control: ReturnType<typeof useForm<FormValues>>["control"];
  errors: any;
  path: "parent1" | "parent2";
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  const e = errors?.[path] || {};

  const PARENT_TYPE_OPTS = toOpts(PARENT_TYPE);
  const YES_NO_OPTS = toOpts<YesNo>(["Yes", "No"]);
  const PREFIX_OPTS = toOpts(PREFIX);
  const SUFFIX_OPTS = toOpts(SUFFIX);
  const EMPLOYMENT_OPTS = toOpts(EMPLOYMENT);
  const INCOME_OPTS = toOpts(INCOME);
  const QUAL_OPTS = toOpts(QUALS);

  return (
    <section>
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <h2 className="text-base font-semibold text-[cbd5e1]">{title}</h2>
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Parent type */}
          <div>
            <Label>Parent type</Label>
            <Controller
              control={control}
              name={`${path}.parentType` as const}
              rules={{ required: "Select parent type" }}
              render={({ field }) => (
                <Select
                  instanceId={`${path}-parentType`}
                  styles={selectStyles}
                  isSearchable
                  isClearable
                  options={PARENT_TYPE_OPTS}
                  value={findOpt(PARENT_TYPE_OPTS, field.value as any)}
                  onChange={(opt) =>
                    field.onChange(((opt?.value as string) || "") as any)
                  }
                  placeholder="Choose…"
                />
              )}
            />
            <FieldError message={e?.parentType?.message as string} />
          </div>

          {/* Two columns grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Living */}
            <div>
              <Label>Is parent living (alive)</Label>
              <Controller
                control={control}
                name={`${path}.living` as const}
                rules={{ required: "Choose Yes or No" }}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-living`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={YES_NO_OPTS}
                    value={findOpt(YES_NO_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
              <FieldError message={e?.living?.message as string} />
            </div>

            {/* Prefix */}
            <div>
              <Label>Prefix</Label>
              <Controller
                control={control}
                name={`${path}.prefix` as const}
                rules={{ required: "Select prefix" }}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-prefix`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={PREFIX_OPTS}
                    value={findOpt(PREFIX_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
              <FieldError message={e?.prefix?.message as string} />
            </div>

            {/* Names */}
            <div>
              <Label>First name</Label>
              <input
                {...register(`${path}.firstName` as const, {
                  required: "First name is required",
                })}
                className={`textInput h-12 w-full rounded-md text-black border px-4 text-sm font-semibold focus:bg-white focus:outline-none ${
                  e?.firstName ? "border-red-400" : "border-slate-200"
                }`}
                placeholder="First name"
              />
              <FieldError message={e?.firstName?.message as string} />
            </div>

            <div>
              <Label>Middle name</Label>
              <input
                {...register(`${path}.middleName` as const)}
                className="textInput h-12 w-full text-black rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="Middle name"
              />
              <FieldError />
            </div>

            <div>
              <Label>Last name</Label>
              <input
                {...register(`${path}.lastName` as const, {
                  required: "Last name is required",
                })}
                className={`textInput h-12 w-full text-black rounded-md border bg-slate-50 px-4 text-sm font-semibold focus:bg-white  focus:outline-none ${
                  e?.lastName ? "border-red-400" : "border-slate-200"
                }`}
                placeholder="Last name"
              />
              <FieldError message={e?.lastName?.message as string} />
            </div>

            <div>
              <Label>Former last name</Label>
              <input
                {...register(`${path}.formerLastName` as const)}
                className="textInput h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="Former last name"
              />
              <FieldError />
            </div>

            {/* Suffix */}
            <div>
              <Label>Suffix</Label>
              <Controller
                control={control}
                name={`${path}.suffix` as const}
                rules={{ required: "Select suffix" }}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-suffix`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={SUFFIX_OPTS}
                    value={findOpt(SUFFIX_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
              <FieldError message={e?.suffix?.message as string} />
            </div>

            {/* Email / Phone */}
            <div>
              <Label>Preferred email</Label>
              <input
                type="email"
                {...register(`${path}.email` as const)}
                className="textInput h-12 w-full text-black rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="email@example.com"
              />
              <FieldError />
            </div>

            <div>
              <Label>Preferred phone</Label>
              <input
                type="tel"
                {...register(`${path}.phone` as const)}
                className="textInput h-12 w-full text-black  rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="+234 801 234 5678"
              />
              <FieldError />
            </div>

            {/* Occupation */}
            <div className="sm:col-span-2">
              <Label>Occupation</Label>
              <input
                {...register(`${path}.occupation` as const)}
                className="textInput h-12 w-full text-black rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="Accountant"
              />
              <FieldError />
            </div>

            {/* Employment status */}
            <div>
              <Label>Employment status</Label>
              <Controller
                control={control}
                name={`${path}.employmentStatus` as const}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-employmentStatus`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={EMPLOYMENT_OPTS}
                    value={findOpt(EMPLOYMENT_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
            </div>

            {/* Currently employed */}
            <div>
              <Label>Is parent currently employed</Label>
              <Controller
                control={control}
                name={`${path}.currentlyEmployed` as const}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-currentlyEmployed`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={toOpts<YesNo>(["Yes", "No"])}
                    value={findOpt(
                      toOpts<YesNo>(["Yes", "No"]),
                      field.value as any
                    )}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
            </div>

            {/* Income */}
            <div>
              <Label>Income per annum</Label>
              <Controller
                control={control}
                name={`${path}.income` as const}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-income`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={INCOME_OPTS}
                    value={findOpt(INCOME_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
            </div>

            {/* Highest qualification */}
            <div>
              <Label>Parent’s highest educational qualification</Label>
              <Controller
                control={control}
                name={`${path}.highestQualification` as const}
                render={({ field }) => (
                  <Select
                    instanceId={`${path}-highestQualification`}
                    styles={selectStyles}
                    isSearchable
                    isClearable
                    options={QUAL_OPTS}
                    value={findOpt(QUAL_OPTS, field.value as any)}
                    onChange={(opt) =>
                      field.onChange(((opt?.value as string) || "") as any)
                    }
                    placeholder="Choose…"
                  />
                )}
              />
            </div>

            {/* Institutions count */}
            <div>
              <Label>Parent’s no of institutions attended</Label>
              <input
                type="number"
                min={0}
                {...register(`${path}.institutionsCount` as const)}
                className="textInput h-12 w-full text-black rounded-md border border-slate-200 bg-slate-50 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="e.g. 2"
              />
              {/* <FieldError /> */}
            </div>

            {/* Degree received */}
            <div>
              <Label>Degrees received by parent from college</Label>
              <input
                {...register(`${path}.degreeReceived` as const)}
                className="textInput h-12 w-full text-black rounded-md border border-slate-200 px-4 text-sm font-semibold focus:bg-white focus:outline-none"
                placeholder="-"
              />
              {/* <FieldError /> */}
            </div>

            {/* Year received (Date of Birth field in your type) */}
            <div>
              <Label>Year received</Label>
              <div className="relative">
                <input
                  type="date"
                  placeholder="Date of Birth"
                  {...register(`${path}.dateOfBirth` as const)}
                  className="textInput h-14 w-full text-black rounded-md border px-4 pr-10 text-base focus:bg-white focus:outline-none border-slate-200 "
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/** ---------- Main component ---------- */
const ParentRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  // helper: normalize unknown date formats to YYYY-MM-DD for <input type="date">
  function toInputDate(s?: string) {
    if (!s) return "";
    const m = moment(s);
    return m.isValid() ? m.format("YYYY-MM-DD") : "";
  }

  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      parent1: {
        parentType: "" as any,
        living: "" as any,
        prefix: "" as any,
        firstName: "",
        middleName: "",
        lastName: "",
        formerLastName: "",
        suffix: "-" as any,
        email: "",
        phone: "",
        occupation: "",
        employmentStatus: "" as any,
        currentlyEmployed: "" as any,
        income: "" as any,
        highestQualification: "" as any,
        institutionsCount: "",
        degreeReceived: "",
        dateOfBirth: "",
      },
      parent2: {
        parentType: "" as any,
        living: "" as any,
        prefix: "" as any,
        firstName: "",
        middleName: "",
        lastName: "",
        formerLastName: "",
        suffix: "-" as any,
        email: "",
        phone: "",
        occupation: "",
        employmentStatus: "" as any,
        currentlyEmployed: "" as any,
        income: "" as any,
        highestQualification: "" as any,
        institutionsCount: "",
        degreeReceived: "",
        dateOfBirth: "",
      },
      ...initialData,
    },
    mode: "onTouched",
  });

  // When initialData arrives (e.g., after fetch), prefill with moment-formatted dates
  useEffect(() => {
    if (!initialData) return;
    const current = getValues();
    reset(
      {
        ...current,
        ...initialData,
        parent1: {
          ...current.parent1,
          ...initialData.parent1,
          dateOfBirth: toInputDate(initialData.parent1?.dateOfBirth),
        },
        parent2: {
          ...current.parent2,
          ...initialData.parent2,
          dateOfBirth: toInputDate(initialData.parent2?.dateOfBirth),
        },
      },
      { keepDirty: false, keepTouched: true }
    );
  }, [initialData, reset, getValues]);

  const [open1, setOpen1] = useState(true);
  const [open2, setOpen2] = useState(false);

  const save = handleSubmit(async (v) => onSave?.(v));

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
          <span className="text-2xl font-extrabold">Parent</span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
        <div className="mt-4 space-y-5">
          <ParentSection
            register={register}
            control={control}
            errors={errors}
            path="parent1"
            title="Parent 1 (Mother)"
            open={open1}
            onToggle={() => setOpen1((s) => !s)}
          />
          <ParentSection
            register={register}
            control={control}
            errors={errors}
            path="parent2"
            title="Parent 2 (Father)"
            open={open2}
            onToggle={() => setOpen2((s) => !s)}
          />
        </div>
        <div className="mx-auto w-full max-w-2xl mt-8">
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

export default ParentRHF;
