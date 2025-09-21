// LanguageRHF.tsx
import React, { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Req } from "../../../../../constants/Required";

type Proficiency =
  | "Elementary Proficiency"
  | "Limited Working Proficiency"
  | "Professional Working Proficiency"
  | "Full Professional Proficiency"
  | "Native or Bilingual Proficiency";

type LangItem = {
  language: "" | (typeof LANGS)[number];
  proficiency: "" | Proficiency;
};

type FormValues = {
  languagesCount: "" | "1" | "2" | "3" | "4" | "5";
  items: LangItem[];
};

const PROFICIENCIES: Proficiency[] = [
  "Elementary Proficiency",
  "Limited Working Proficiency",
  "Professional Working Proficiency",
  "Full Professional Proficiency",
  "Native or Bilingual Proficiency",
];

const LANGS = [
  "English (US)",
  "French",
  "Spanish",
  "Arabic",
  "Yoruba",
  "Igbo",
  "Hausa",
  "Swahili",
] as const;

const LanguageRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    control,
    register,
    getValues,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      languagesCount: "",
      items: [],
      ...initialData,
    },
    mode: "onTouched",
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  // keep items array length in sync with languagesCount
  const countStr = watch("languagesCount");
  useEffect(() => {
    const n = Number(countStr || 0);
    if (!Number.isFinite(n) || n < 0) return;

    // if no items yet and initialData contains items, seed with it
    if (fields.length === 0 && initialData?.items?.length) {
      replace(initialData.items as LangItem[]);
      return;
    }

    if (fields.length < n) {
      for (let i = fields.length; i < n; i++) {
        append({ language: "", proficiency: "" });
      }
    } else if (fields.length > n) {
      // remove extra from end
      for (let i = fields.length - 1; i >= n; i--) remove(i);
    }
  }, [countStr, append, remove, fields.length, initialData?.items, replace]);

  const isEmpty = (v?: string) => !v;

  const handleSave = handleSubmit(async (v) => {
    await onSave?.(v);
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
            Language <Req />
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-5 sm:px-6 pb-40">
        {/* How many languages */}
        <section className="mt-8">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            How many no of language are you proficient in
          </label>
          <div className="relative">
            <select
              {...register("languagesCount", { required: "Select a number" })}
              className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                ${
                  errors.languagesCount
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200"
                }
                ${
                  isEmpty(watch("languagesCount"))
                    ? "text-slate-400"
                    : "text-slate-900"
                }`}
            >
              <option value="" disabled hidden>
                Select number
              </option>
              {["1", "2", "3", "4", "5"].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.languagesCount?.message}
          </div>
        </section>

        {/* N language + proficiency pairs */}
        {fields.map((f, idx) => (
          <section key={f.id} className="mt-6">
            <h3 className="mb-3 text-lg font-semibold text-slate-900">{`Language ${
              idx + 1
            }`}</h3>

            {/* Language select */}
            <div className="mb-4">
              <label className="mb-2 block text-base text-slate-700">
                Select language
              </label>
              <div className="relative">
                <select
                  {...register(`items.${idx}.language` as const, {
                    required: "Choose a language",
                  })}
                  className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                    ${
                      errors.items?.[idx]?.language
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200"
                    }
                    ${
                      isEmpty(watch(`items.${idx}.language`))
                        ? "text-slate-400"
                        : "text-slate-900"
                    }`}
                >
                  <option value="" disabled hidden>
                    Choose language
                  </option>
                  {LANGS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="min-h-5 mt-1 text-sm text-red-600">
                {errors.items?.[idx]?.language?.message as string}
              </div>
            </div>

            {/* Proficiency select */}
            <div>
              <label className="mb-2 block text-base text-slate-700">
                Language Proficiency
              </label>
              <div className="relative">
                <select
                  {...register(`items.${idx}.proficiency` as const, {
                    required: "Choose proficiency",
                  })}
                  className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                    ${
                      errors.items?.[idx]?.proficiency
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200"
                    }
                    ${
                      isEmpty(watch(`items.${idx}.proficiency`))
                        ? "text-slate-400"
                        : "text-slate-900"
                    }`}
                >
                  <option value="" disabled hidden>
                    Choose proficiency
                  </option>
                  {PROFICIENCIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <div className="min-h-5 mt-1 text-sm text-red-600">
                {errors.items?.[idx]?.proficiency?.message as string}
              </div>
            </div>
          </section>
        ))}
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

      {/* Bottom bar */}
    </div>
  );
};

export default LanguageRHF;
