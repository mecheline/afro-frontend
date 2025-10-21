// DemographicsRHF.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Req } from "../../../../../constants/Required";
import { useGetAccountQuery } from "../../../../../redux/services/scholar/api";

type FormValues = {
  gender: "" | "Male" | "Female" | "Other";
};

const DemographicsRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void; // navigate only
  onNext?: (values: FormValues) => void; // navigate only
  onSave?: (values: FormValues) => Promise<void> | void; // persist
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const { data: accountInfo, isSuccess } = useGetAccountQuery({});
  console.log(accountInfo);

  const mapAccountToPersonalInfo = (account: any) => ({
    gender: account?.profile?.gender,
  });
 

  const { register, handleSubmit, getValues, reset, formState, watch } =
    useForm<FormValues>({
      defaultValues: { gender: "", ...initialData },
      mode: "onTouched",
    });

  const { errors } = formState;

  useEffect(() => {
    if (initialData) reset({ ...initialData });
  }, [initialData, reset]);

  const gender = watch("gender");
  const isPlaceholder = !gender;

  useEffect(() => {
    if (accountInfo && !formState.isDirty) {
      const mapped = mapAccountToPersonalInfo(accountInfo);
      reset(mapped);
    }
  }, [isSuccess, formState.isDirty, reset, accountInfo]);

  const handleSave = handleSubmit(async (values) => {
    await onSave?.(values);
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="headerTitle"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-3xl font-extrabold">
            Demographics
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 pb-40">
        <section className="mt-8">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            Gender <Req />
          </label>

          <div className="rounded-2xl bg-slate-50/70 p-3">
            <div className="relative">
              <select
                {...register("gender", {
                  required: "Please select your gender",
                })}
                className={`h-12 w-full appearance-none rounded-md border bg-white px-4 pr-10 text-base font-semibold focus:outline-none 
                ${
                  errors.gender
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                } 
                ${isPlaceholder ? "text-slate-400" : "text-slate-900"}`}
              >
                <option value="" disabled hidden>
                  Select gender
                </option>
                <option>Female</option>
                <option>Male</option>
                <option>Other</option>
              </select>

              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                aria-hidden="true"
              />
            </div>
          </div>

          {/* Reserve space for error to avoid layout shift */}
          <div className="h-5 mt-1 text-sm text-red-600">
            {errors.gender?.message}
          </div>
        </section>
        <div className="mx-auto w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="h-12 rounded-2xl border-2 border-[#2F56D9] text-base font-semibold text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => onNext?.(getValues())}
              className="h-12 rounded-2xl bg-slate-100 text-base font-semibold text-[#2F56D9] shadow hover:bg-slate-200 focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DemographicsRHF;
