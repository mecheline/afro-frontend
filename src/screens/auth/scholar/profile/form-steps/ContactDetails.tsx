// ContactDetailsRHF.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Phone } from "lucide-react";
import { Req } from "../../../../../constants/Required";
import { useGetAccountQuery } from "../../../../../redux/services/scholar/api";

type FormValues = {
  preferredPhone: string;
  alternatePhone?: string;
};

const ContactDetailsRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void; // navigate only
  onNext?: (values: FormValues) => void; // navigate only
  onSave?: (values: FormValues) => Promise<void> | void; // persist
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const { data: accountInfo, isSuccess } = useGetAccountQuery({});
  console.log(accountInfo);

  const mapAccountToPersonalInfo = (account: any) => ({
    preferredPhone: account?.profile?.phone,
  });

  console.log(mapAccountToPersonalInfo(accountInfo));

  const { register, handleSubmit, getValues, reset, formState } =
    useForm<FormValues>({
      defaultValues: {
        preferredPhone: "",
        alternatePhone: "",
        ...initialData,
      },
      mode: "onTouched",
    });

  const { errors } = formState;

  console.log(initialData);

  useEffect(() => {
    if (initialData) reset({ ...initialData });
  }, [initialData, reset]);

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
          <span className="text-3xl font-extrabold">Contact Details</span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 pb-40">
        {/* Preferred phone */}
        <section className="mt-8">
          <label className="text-xl font-semibold ">
            Preferred phone <Req />
          </label>

          <div className="mt-3 rounded-2xl bg-slate-50/70 p-3">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                inputMode="tel"
                placeholder="+234 816 503 3526"
                {...register("preferredPhone", {
                  required: "Preferred phone is required",
                  minLength: { value: 6, message: "Enter a valid phone" },
                })}
                className={`h-12 w-full rounded-md border bg-white pl-10 pr-3 text-base font-semibold focus:outline-none ${
                  errors.preferredPhone
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                }`}
              />
            </div>
          </div>
          {/* Reserve space to avoid layout shift */}
          <div className="h-5 mt-1 text-sm text-red-600">
            {errors.preferredPhone?.message}
          </div>
        </section>

        {/* Alternate phone */}
        <section className="mt-8">
          <label className="text-xl font-semibold ">Alternate phone</label>

          <div className="mt-3 rounded-2xl bg-slate-50/70 p-3">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                inputMode="tel"
                placeholder="+234 816 503 3526"
                {...register("alternatePhone")}
                className="h-12 w-full rounded-md border border-slate-200 bg-white pl-10 pr-3 text-base font-semibold focus:outline-none "
              />
            </div>
          </div>
          <div className="h-5 mt-1 text-sm invisible">.</div>
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

export default ContactDetailsRHF;
