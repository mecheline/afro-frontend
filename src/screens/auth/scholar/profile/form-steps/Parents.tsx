// ParentRHF.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
    | "₦200k-₦500k"
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

const SUFFIX: ParentBlock["suffix"][] = [
  "-",
  "Jr.",
  "Sr.",
  "I",
  "II",
  "III",
  "IV",
  "V",
];

const EMPLOYMENT: ParentBlock["employmentStatus"][] = [
  "Employed",
  "Unemployed",
  "Self-employed",
  "Retired",
];

const INCOME: ParentBlock["income"][] = [
  "Below ₦100k",
  "₦100k-₦200k",
  "₦200k-₦500k",
  "₦500k-₦1m",
  "Above ₦1m",
];

const QUALS: ParentBlock["highestQualification"][] = [
  "Primary",
  "Secondary",
  "Diploma",
  "Graduate",
  "Postgraduate",
];

const YEARS = Array.from({ length: 34 }).map(
  (_, i) => `${new Date().getFullYear() - i}`
);
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** ---------- Small helpers ---------- */
const Label: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <label className={`mb-2 block text-sm text-slate-600 ${className}`}>
    {children}
  </label>
);

const SelectCaret: React.FC = () => (
  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
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
  errors,
  path,
  title,
  open,
  onToggle,
}: {
  register: ReturnType<typeof useForm<FormValues>>["register"];
  errors: any;
  path: "parent1" | "parent2";
  title: string;
  open: boolean;
  onToggle: () => void;
}) {
  const e = errors?.[path] || {};

  return (
    <section className="rounded-2xl border border-slate-200 p-4">
      {/* Section Header */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between"
      >
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {open ? (
          <ChevronUp className="h-5 w-5 text-slate-500" />
        ) : (
          <ChevronDown className="h-5 w-5 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          {/* Parent type */}
          <div className="relative">
            <Label>Parent type</Label>
            <div className="relative">
              <select
                {...register(`${path}.parentType` as const, {
                  required: "Select parent type",
                })}
                className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  e?.parentType ? "border-red-400" : "border-slate-200"
                }`}
              >
                <option value="" disabled>
                  Choose…
                </option>
                {PARENT_TYPE.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <SelectCaret />
            </div>
            <FieldError message={e?.parentType?.message as string} />
          </div>

          {/* Two columns grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Living */}
            <div className="relative">
              <Label>Is parent living (alive)</Label>
              <div className="relative">
                <select
                  {...register(`${path}.living` as const, {
                    required: "Choose Yes or No",
                  })}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                    e?.living ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
                <SelectCaret />
              </div>
              <FieldError message={e?.living?.message as string} />
            </div>

            {/* Prefix */}
            <div className="relative">
              <Label>Prefix</Label>
              <div className="relative">
                <select
                  {...register(`${path}.prefix` as const, {
                    required: "Select prefix",
                  })}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                    e?.prefix ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {PREFIX.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <SelectCaret />
              </div>
              <FieldError message={e?.prefix?.message as string} />
            </div>

            {/* Names */}
            <div>
              <Label>First name</Label>
              <input
                {...register(`${path}.firstName` as const, {
                  required: "First name is required",
                })}
                className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                  e?.firstName ? "border-red-400" : "border-slate-200"
                }`}
                placeholder="First name"
              />
              <FieldError message={e?.firstName?.message as string} />
            </div>

            <div>
              <Label>Middle name</Label>
              <div className="relative">
                <input
                  {...register(`${path}.middleName` as const)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  placeholder="Middle name"
                />
              </div>
              <FieldError />
            </div>

            <div>
              <Label>Last name</Label>
              <div className="relative">
                <input
                  {...register(`${path}.lastName` as const, {
                    required: "Last name is required",
                  })}
                  className={`h-12 w-full rounded-xl border bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                    e?.lastName ? "border-red-400" : "border-slate-200"
                  }`}
                  placeholder="Last name"
                />
              </div>
              <FieldError message={e?.lastName?.message as string} />
            </div>

            <div>
              <Label>Former last name</Label>
              <input
                {...register(`${path}.formerLastName` as const)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="Former last name"
              />
              <FieldError />
            </div>

            {/* Suffix */}
            <div className="relative">
              <Label>Suffix</Label>
              <div className="relative">
                <select
                  {...register(`${path}.suffix` as const, {
                    required: "Select suffix",
                  })}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                    e?.suffix ? "border-red-400" : "border-slate-200"
                  }`}
                >
                  {SUFFIX.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <SelectCaret />
              </div>
              <FieldError message={e?.suffix?.message as string} />
            </div>

            {/* Email / Phone */}
            <div>
              <Label>Preferred email</Label>
              <input
                type="email"
                {...register(`${path}.email` as const)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="email@example.com"
              />
              <FieldError />
            </div>

            <div>
              <Label>Preferred phone</Label>
              <input
                type="tel"
                {...register(`${path}.phone` as const)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="+234 801 234 5678"
              />
              <FieldError />
            </div>

            {/* Occupation */}
            <div className="sm:col-span-2">
              <Label>Occupation</Label>
              <div className="relative">
                <input
                  {...register(`${path}.occupation` as const)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                  placeholder="Accountant"
                />
              </div>
              <FieldError />
            </div>

            {/* Employment status */}
            <div className="relative">
              <Label>Employment status</Label>
              <div className="relative">
                <select
                  {...register(`${path}.employmentStatus` as const)}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 border-slate-200`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {EMPLOYMENT.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <SelectCaret />
              </div>
              {/* <FieldError message={e?.employmentStatus?.message as string} /> */}
            </div>

            {/* Currently employed */}
            <div className="relative">
              <Label>Is parent currently employed</Label>
              <div className="relative">
                <select
                  {...register(`${path}.currentlyEmployed` as const)}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 border-slate-200`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
                <SelectCaret />
              </div>
              {/* <FieldError message={e?.currentlyEmployed?.message as string} /> */}
            </div>

            {/* Income */}
            <div className="relative">
              <Label>Income per annum</Label>
              <div className="relative">
                <select
                  {...register(`${path}.income` as const)}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 border-slate-200`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {INCOME.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <SelectCaret />
              </div>
             {/*  <FieldError message={e?.income?.message as string} /> */}
            </div>

            {/* Highest qualification */}
            <div className="relative">
              <Label>Parent’s highest educational qualification</Label>
              <div className="relative">
                <select
                  {...register(`${path}.highestQualification` as const)}
                  className={`h-12 w-full appearance-none rounded-xl border bg-slate-50 px-4 pr-8 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 border-slate-200`}
                >
                  <option value="" disabled>
                    Choose…
                  </option>
                  {QUALS.map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
                <SelectCaret />
              </div>
              {/*  <FieldError
                message={e?.highestQualification?.message as string}
              /> */}
            </div>

            {/* Institutions count */}
            <div>
              <Label>Parent’s no of institutions attended</Label>
              <input
                type="number"
                min={0}
                {...register(`${path}.institutionsCount` as const)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="e.g. 2"
              />
              {/* <FieldError /> */}
            </div>

            {/* Degree received */}
            <div>
              <Label>Degrees received by parent from college</Label>
              <input
                {...register(`${path}.degreeReceived` as const)}
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="-"
              />
              {/*  <FieldError /> */}
            </div>

            {/* Year received */}
            <div>
              <Label>Year received</Label>

              <div className="relative">
                <input
                  type="date"
                  placeholder="Date of Birth"
                  {...register(`${path}.dateOfBirth` as const)}
                  className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 border-slate-200 focus:border-indigo-500 focus:ring-indigo-100`}
                />
                {/* {errors.dateOfBirth && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.dateOfBirth.message}
                  </p>
                )} */}
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
  const m = moment(s); // parses ISO and many common formats
  return m.isValid() ? m.format("YYYY-MM-DD") : "";
}





  const {
    register,
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
        dateOfBirth:""
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
        dateOfBirth:""
      },
      ...initialData,
    },
    mode: "onTouched",
  });

  +// When initialData arrives (e.g., after fetch), prefill with moment-formatted dates
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-2xl font-extrabold text-slate-900">Parent</span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
        <div className="mt-4 space-y-5">
          <ParentSection
            register={register}
            errors={errors}
            path="parent1"
            title="Parent 1 (Mother)"
            open={open1}
            onToggle={() => setOpen1((s) => !s)}
          />
          <ParentSection
            register={register}
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
