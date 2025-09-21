// AddressStepRHF.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, MapPin } from "lucide-react";
import  { Req } from "../../../../../constants/Required";

type AddressForm = { homeAddress: string; altAddress?: string };

const AddressStepForm: React.FC<{
  initialData?: Partial<AddressForm>;
  onPrev: (values?: AddressForm) => void;
  onNext: (values?: AddressForm) => void; // navigate only
  onSave: (values: AddressForm) => Promise<void>;
  isSaving: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm<AddressForm>({
    defaultValues: { homeAddress: "", altAddress: "", ...initialData },
    mode: "onTouched",
  });

  useEffect(() => {
    if (initialData) reset({ ...initialData });
  }, [initialData, reset]);

  const submitSave = handleSubmit((values) => onSave(values));

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <header className="mx-auto w-full px-4 pt-4 sm:px-6 sm:pt-4">
        <button
          onClick={() => onPrev(getValues())}
          className="inline-flex items-center gap-3 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-3xl font-extrabold text-slate-900">
            Address
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 sm:px-6">
        {/* Permanent Home Address */}
        <section className="mt-4">
          <h3 className="text-lg font-semibold text-slate-700">
            Permanent Home Address <Req />
          </h3>

          <div className="mt-2">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register("homeAddress", {
                  required: "Home address is required",
                })}
                placeholder="12, Akanbi Disu, Ikota, Lekki, Lagos"
                className={`h-14 w-full rounded-2xl border bg-slate-50/70 pl-10 pr-4 text-base font-semibold text-slate-900 shadow-sm
                focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.homeAddress
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }`}
              />
            </div>
            <p
              className={`mt-1 h-5 text-sm ${
                errors.homeAddress ? "text-red-600" : "invisible"
              }`}
            >
              {errors.homeAddress?.message || "placeholder"}
            </p>
          </div>
        </section>

        {/* Alternate mailing address */}
        <section className="mt-4">
          <label className="mt-5 block text-lg font-semibold text-slate-700">
            Alternate mailing address
          </label>

          <div className="mt-3">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <MapPin className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register("altAddress")}
                placeholder="12, Akanbi Disu, Ikota, Lekki, Lagos"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-base font-semibold text-slate-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              />
            </div>
            <p className="mt-1 h-5 text-sm invisible">placeholder</p>
          </div>
        </section>
        {/* Bottom action bar */}
        <div className=" border-slate-200 bg-white/95 p-4 backdrop-blur">
          <div className="mx-auto w-full max-w-xl space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={submitSave}
                disabled={isSaving}
                className="h-12 rounded-2xl bg-[#2F56D9] text-white"
              >
                {isSaving ? "Saving…" : "Save"}
              </button>
              <button
                onClick={() => onNext(getValues())}
                className="h-12 rounded-2xl bg-slate-100 text-[#2F56D9]"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddressStepForm;
