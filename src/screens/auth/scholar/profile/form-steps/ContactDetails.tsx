// ContactDetailsRHF.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Phone } from "lucide-react";

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
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      preferredPhone: "",
      alternatePhone: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialData) reset({ ...initialData });
  }, [initialData, reset]);

  const handleSave = handleSubmit(async (values) => {
    await onSave?.(values);
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-3xl font-extrabold text-slate-900">
            Contact Details
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-5 sm:px-6 pb-40">
        {/* Preferred phone */}
        <section className="mt-8">
          <h3 className="text-xl font-semibold text-slate-700">
            Preferred phone
          </h3>

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
                className={`h-12 w-full rounded-xl border bg-white pl-10 pr-3 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
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
          <h3 className="text-xl font-semibold text-slate-700">
            Alternate phone
          </h3>

          <div className="mt-3 rounded-2xl bg-slate-50/70 p-3">
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                inputMode="tel"
                placeholder="+234 816 503 3526"
                {...register("alternatePhone")}
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
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
