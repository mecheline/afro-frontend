// AddressStepRHF.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, MapPin } from "lucide-react";
import { Req } from "../../../../../constants/Required";

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
    <div className="min-h-screen">
      {/* Top bar */}
      <header className="mx-auto w-full px-4 pt-4 sm:px-6 sm:pt-4">
        <button
          onClick={() => onPrev(getValues())}
          className="headerTitle"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6" />
          <span className="text-3xl font-extrabold">Address</span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        {/* Permanent Home Address */}
        <section className="mt-4">
          <label className="text-lg font-semibold ">
            Permanent Home Address <Req />
          </label>

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
                className={`textInput h-14 w-full rounded-md border pl-10 pr-4 text-base font-semibold text-slate-900
                ${
                  errors.homeAddress
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
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
          <label className="mt-5 block text-lg font-semibold ">
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
                className="textInput h-14 w-full rounded-md border pl-10 pr-4 text-base font-semibold "
              />
            </div>
            <p className="mt-1 h-5 text-sm invisible">placeholder</p>
          </div>
        </section>
        {/* Bottom action bar */}
        <div className=" border-slate-200  p-4 backdrop-blur">
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
