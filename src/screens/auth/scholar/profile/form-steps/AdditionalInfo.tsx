// AdditionalInfoRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";

type FormValues = {
  personalStatement: string;
  educationOpinion: string;
  extraCircumstances: string;
};

const AdditionalInfoRHF: React.FC<{
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
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      personalStatement: "",
      educationOpinion: "",
      extraCircumstances: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  const submit = handleSubmit(async (v) => onSave?.(v));

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
            Additional Info
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Personal statement */}
        <div className="mb-6">
          <label className="mb-2 block text-lg text-slate-700">
            Personal statement
          </label>
          <textarea
            rows={8}
            placeholder="Description"
            {...register("personalStatement", {
              maxLength: { value: 3000, message: "Max 3000 characters" },
            })}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-4 text-base leading-relaxed shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.personalStatement
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.personalStatement?.message}
          </div>
        </div>

        {/* Opinion on education */}
        <div className="mb-6">
          <label className="mb-2 block text-lg text-slate-700">
            Do you wish to share anything on state of education in Nigeria and
            Africa
          </label>
          <textarea
            rows={8}
            placeholder="Description"
            {...register("educationOpinion", {
              maxLength: { value: 3000, message: "Max 3000 characters" },
            })}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-4 text-base leading-relaxed shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.educationOpinion
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.educationOpinion?.message}
          </div>
        </div>

        {/* Extra circumstances */}
        <div>
          <label className="mb-2 block text-lg text-slate-700">
            Do you wish to provide details of circumstances or qualification not
            reflected in the application
          </label>
          <textarea
            rows={8}
            placeholder="Description"
            {...register("extraCircumstances", {
              maxLength: { value: 3000, message: "Max 3000 characters" },
            })}
            className={`w-full rounded-2xl border bg-slate-50 px-4 py-4 text-base leading-relaxed shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
              errors.extraCircumstances
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
            }`}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.extraCircumstances?.message}
          </div>
        </div>
        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-4">
          <button
            type="button"
            onClick={submit}
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
      </main>
    </div>
  );
};

export default AdditionalInfoRHF;
