// LeadershipTrackRecordRHF.tsx
import React, { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ChevronDown, Plus } from "lucide-react";

type Org = {
  name: string;
  address: string;
  phone: string;
  email: string;
};

type FormValues = {
  contribution: string;
  organizations: Org[];
};

const emptyOrg: Org = { name: "", address: "", phone: "", email: "" };

const LeadershipTrackRecordRHF: React.FC<{
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
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      contribution: "",
      organizations: [emptyOrg],
      ...initialData,
    },
    mode: "onTouched",
  });

  const { fields, append } = useFieldArray({
    control,
    name: "organizations",
  });

  // collapsible sections
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true });

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
          <span className="text-2xl font-extrabold text-slate-900">
            Leadership Track Record
          </span>
        </button>
      </div>

      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Contribution textarea */}
        <div className="mt-6">
          <p className="mb-2 text-slate-600">
            Share your contribution to make your community better
          </p>
          <textarea
            rows={6}
            placeholder="Write here..."
            {...register("contribution", {
              required: "Please tell us about your contribution",
              minLength: { value: 20, message: "At least 20 characters" },
            })}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.contribution
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
          <div className="min-h-5 text-sm text-red-600">
            {errors.contribution?.message as string}
          </div>
        </div>

        {/* Organizations (repeatable) */}
        <div className="mt-4 space-y-6">
          {fields.map((f, i) => {
            const isOpen = open[i] ?? i === 0;
            return (
              <div key={f.id} className="rounded-2xl">
                <button
                  type="button"
                  onClick={() => setOpen((s) => ({ ...s, [i]: !isOpen }))}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
                >
                  <span className="text-lg font-semibold text-slate-900">
                    Organizations {i + 1}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 text-indigo-600 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="mt-4 space-y-5">
                    {/* Name */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Name
                      </label>
                      <input
                        {...register(`organizations.${i}.name` as const, {
                          required: "Organization name is required",
                        })}
                        placeholder="Enter"
                        className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                          errors.organizations?.[i]?.name
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                        }`}
                      />
                      <div className="min-h-5 text-sm text-red-600">
                        {errors.organizations?.[i]?.name &&
                          String(errors.organizations[i]?.name?.message)}
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="mb-2 block text-base text-slate-700">
                        Address
                      </label>
                      <input
                        {...register(`organizations.${i}.address` as const)}
                        placeholder="Enter"
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
                        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
                        className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                          errors.organizations?.[i]?.email
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                        }`}
                      />
                      <div className="min-h-5 text-sm text-red-600">
                        {errors.organizations?.[i]?.email &&
                          String(errors.organizations[i]?.email?.message)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add organization */}
          <button
            type="button"
            onClick={() => append({ ...emptyOrg })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-indigo-200 bg-indigo-50 py-3 text-indigo-700 hover:bg-indigo-100"
          >
            <Plus className="h-4 w-4" />
            Add another organization
          </button>
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

export default LeadershipTrackRecordRHF;
