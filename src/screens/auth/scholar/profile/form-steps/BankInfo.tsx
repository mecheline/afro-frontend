// ScholarBankDetailsForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, CreditCard, Landmark, Hash } from "lucide-react";
import { Req } from "../../../../../constants/Required";
import { useGetBanksQuery } from "../../../../../redux/services/scholar/api";

type BankForm = {
  accountName: string;
  accountNumber: string;
  bankName: string;
  bankCode: string;
};

const ScholarBankDetailsForm: React.FC<{
  initialData?: Partial<BankForm>;
  onPrev: (values?: BankForm) => void;
  onNext: (values?: BankForm) => void;
  onSave: (values: BankForm) => Promise<void>;
  isSaving: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<BankForm>({
    defaultValues: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      bankCode: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  // RTK: fetch Paystack banks
  const { data: banksResp, isLoading: banksLoading } = useGetBanksQuery();
  const banks = banksResp?.banks ?? [];

  // Prefill from initialData when it changes
  useEffect(() => {
    if (initialData) {
      reset({ ...initialData });
    }
  }, [initialData, reset]);

  // 🔹 NEW: once banks have loaded, re-apply bankName/bankCode so select shows correctly
  useEffect(() => {
    if (!banksLoading && banks.length && initialData?.bankName) {
      // set bankName from backend
      setValue("bankName", initialData.bankName, {
        shouldDirty: false,
        shouldValidate: true,
      });

      // if we already have bankCode from backend, keep it
      if (initialData.bankCode) {
        setValue("bankCode", initialData.bankCode, {
          shouldDirty: false,
          shouldValidate: false,
        });
      } else {
        // otherwise derive from banks list
        const match = banks.find((b) => b.name === initialData.bankName);
        if (match?.code) {
          setValue("bankCode", match.code, {
            shouldDirty: false,
            shouldValidate: false,
          });
        }
      }
    }
  }, [banksLoading, banks, initialData, setValue]);

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
          <span className="text-3xl font-extrabold">Bank Details</span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 sm:px-6">
        {/* Account Name */}
        <section className="mt-4">
          <label className="text-lg font-semibold ">
            Account Name <Req />
          </label>
          <div className="mt-2">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <CreditCard className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register("accountName", {
                  required: "Account name is required",
                  minLength: {
                    value: 3,
                    message: "Account name is too short",
                  },
                })}
                placeholder="e.g. John Doe"
                className={`textInput h-14 w-full rounded-md border pl-10 pr-4 text-base font-semibold text-slate-900
                ${
                  errors.accountName
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                }`}
              />
            </div>
            <p
              className={`mt-1 h-5 text-sm ${
                errors.accountName ? "text-red-600" : "invisible"
              }`}
            >
              {errors.accountName?.message || "placeholder"}
            </p>
          </div>
        </section>

        {/* Account Number */}
        <section className="mt-4">
          <label className="text-lg font-semibold ">
            Account Number <Req />
          </label>
          <div className="mt-2">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Hash className="h-5 w-5 text-slate-400" />
              </div>
              <input
                {...register("accountNumber", {
                  required: "Account number is required",
                  pattern: {
                    value: /^\d{10}$/,
                    message: "Account number must be 10 digits",
                  },
                })}
                inputMode="numeric"
                maxLength={10}
                placeholder="0123456789"
                className={`textInput h-14 w-full rounded-md border pl-10 pr-4 text-base font-semibold text-slate-900
                ${
                  errors.accountNumber
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                }`}
              />
            </div>
            <p
              className={`mt-1 h-5 text-sm ${
                errors.accountNumber ? "text-red-600" : "invisible"
              }`}
            >
              {errors.accountNumber?.message || "placeholder"}
            </p>
          </div>
        </section>

        {/* Bank Name (select from Paystack banks) */}
        <section className="mt-4">
          <label className="text-lg font-semibold ">
            Bank Name <Req />
          </label>
          <div className="mt-2">
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <Landmark className="h-5 w-5 text-slate-400" />
              </div>
              <select
                {...register("bankName", {
                  required: "Bank name is required",
                })}
                disabled={banksLoading}
                onChange={(e) => {
                  const name = e.target.value;
                  const selected = banks.find((b) => b.name === name);
                  setValue("bankName", name, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  setValue("bankCode", selected?.code ?? "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }}
                className={`textInput h-14 w-full rounded-md border pl-10 pr-4 text-base font-semibold text-slate-900 bg-white
                ${
                  errors.bankName
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                }`}
              >
                <option value="">
                  {banksLoading ? "Loading banks…" : "Select your bank"}
                </option>
                {banks.map((bank) => (
                  <option key={bank.code} value={bank.name}>
                    {bank.name}
                  </option>
                ))}
              </select>
            </div>
            <p
              className={`mt-1 h-5 text-sm ${
                errors.bankName ? "text-red-600" : "invisible"
              }`}
            >
              {errors.bankName?.message || "placeholder"}
            </p>
          </div>
        </section>

        {/* Hidden Bank Code (set from bank selection / initialData) */}
        <input
          type="hidden"
          {...register("bankCode", {
            required: "Bank code is required",
          })}
        />
        {errors.bankCode && (
          <p className="mt-1 h-5 text-sm text-red-600">
            {errors.bankCode.message}
          </p>
        )}

        {/* Bottom action bar */}
        <div className="border-slate-200 p-4 backdrop-blur">
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

export default ScholarBankDetailsForm;
