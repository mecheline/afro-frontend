// CommunityBasedOrgRHF.tsx
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";

type Organization = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

type FormValues = {
  orgCount: number;
  organizations: Organization[];
};

const emptyOrg: Organization = { name: "", address: "", phone: "", email: "" };

const CommunityBasedOrgRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      orgCount: 1,
      organizations: [emptyOrg],
      ...initialData,
    },
    mode: "onTouched",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "organizations",
  });

  const orgCount = watch("orgCount");

  // Ensure organizations length matches orgCount
  useEffect(() => {
    if (orgCount < 1) {
      setValue("orgCount", 1);
      return;
    }
    if (fields.length === orgCount) return;

    if (fields.length < orgCount) {
      const toAdd = Array.from({ length: orgCount - fields.length }, () => ({
        ...emptyOrg,
      }));
      toAdd.forEach(() => append({ ...emptyOrg }));
    } else {
      // remove extra from end
      for (let i = fields.length - 1; i >= orgCount; i--) remove(i);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgCount, fields.length]);

  // per-section open/close state
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });
  useEffect(() => {
    // ensure state exists for each index
    const next: Record<number, boolean> = {};
    for (let i = 0; i < orgCount; i++) {
      next[i] = open[i] ?? i === 0;
    }
    setOpen(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgCount]);

  const save = handleSubmit(async (v) => onSave?.(v));

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="headerTitle"
        >
          <ArrowLeft className="h-6 w-6 " />
          <span className="text-2xl font-extrabold">Community Based Org.</span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
        <p className="mt-4">
          Summary of community based or voluntary organization(s) that have
          supported your educational pursuit either financially, mentoring,
          career guidance or in any other way
        </p>

        {/* Count */}
        <div className="mt-5">
          <label className="mb-2 text-base font-semibold text-slate-700">
            How many organizations?
          </label>
          <div className="relative">
            <select
              {...register("orgCount", {
                valueAsNumber: true,
                min: { value: 1, message: "Minimum is 1" },
              })}
              className="textInput h-14 w-full appearance-none rounded-md border border-slate-200 bg-slate-50 px-4 pr-10 text-base focus:bg-white focus:outline-none"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          {errors.orgCount && (
            <p className="mt-1 text-sm text-red-600">
              {String(errors.orgCount.message)}
            </p>
          )}
        </div>

        {/* Organizations */}
        <div className="mt-6 space-y-6">
          {fields.map((f, i) => {
            const sectionOpen = !!open[i];
            return (
              <div key={f.id} className="rounded-2xl">
                {/* Section header */}
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [i]: !s[i] }))}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                >
                  <span className="text-lg font-semibold text-slate-900">
                    Organizations {i + 1}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-indigo-600 transition-transform ${
                      sectionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Fields */}
                {sectionOpen && (
                  <div className="mt-4 space-y-5">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Name
                      </label>
                      <input
                        {...register(`organizations.${i}.name` as const, {
                          required: "Name is required",
                        })}
                        placeholder="Enter"
                        className={`textInput h-12 w-full rounded-md border px-4 text-base focus:bg-white focus:outline-none  ${
                          errors.organizations?.[i]?.name
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-200"
                        }`}
                      />
                      {errors.organizations?.[i]?.name && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.organizations[i]?.name?.message)}
                        </p>
                      )}
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Address
                      </label>
                      <input
                        {...register(`organizations.${i}.address` as const)}
                        placeholder="Enter"
                        className="textInput h-12 w-full rounded-md border border-slate-200 bg-slate-50 px-4 text-base focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Phone Number
                      </label>
                      <input
                        inputMode="tel"
                        {...register(`organizations.${i}.phone` as const)}
                        placeholder="Enter"
                        className="textInput h-12 w-full rounded-md border border-slate-200 px-4 text-base focus:bg-white focus:outline-none"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Email Address
                      </label>
                      <input
                        type="email"
                        {...register(`organizations.${i}.email` as const, {
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/i,
                            message: "Enter a valid email",
                          },
                        })}
                        placeholder="Enter"
                        className={`textInput h-12 w-full rounded-md border px-4 text-base focus:bg-white focus:outline-none ${
                          errors.organizations?.[i]?.email
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-200"
                        }`}
                      />
                      {errors.organizations?.[i]?.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.organizations[i]?.email?.message)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
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

export default CommunityBasedOrgRHF;
