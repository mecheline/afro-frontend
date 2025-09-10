// EducationRHF.tsx
import React, { useState } from "react";
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
  minQualification?: Qualification;
};

type FormValues = {
  primary: Level;
  secondary: Level;
  tertiary: Level;
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
    //formState: { errors },
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
        minQualification: undefined as any,
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

              {/* Extra tertiary fields */}
              <div>
                <label className="mb-2 block text-base text-slate-700">
                  Field of study
                </label>
                <input
                  type="text"
                  placeholder="e.g., Computer Science"
                  {...register("tertiary.fieldOfStudy")}
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />
              </div>

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
