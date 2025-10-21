// src/features/scholarships/steps/Step1Details.tsx
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import type {
  Scholarship,
  ScholarshipCategory,
} from "../../../../redux/services/scholar/api";

type FormVals = {
  title: string;
  category: ScholarshipCategory;
  logoFile?: File | null;
  removeLogo?: boolean;
};

const CATEGORY_OPTS = (
  ["Secondary", "WASSCE", "Undergraduate", "Masters", "PHD"] as const
).map((v) => ({ value: v, label: v }));

const toOption = (v?: string) => (v ? { value: v, label: v } : null);

const Step1Details: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: Scholarship; // should include initial.logo?.url if present
  isSubmitted?: boolean;
  onSubmit: (v: FormVals) => Promise<void> | void;
}> = ({ formId, hideButtons, initial, isSubmitted, onSubmit }) => {
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormVals>({
    defaultValues: {
      title: "",
      category: "Secondary",
      logoFile: null,
      removeLogo: false,
    },
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const existingLogoUrl = (initial as any)?.logo?.url || null;

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        category: initial.category,
        logoFile: null,
        removeLogo: false,
      });
      setPreviewUrl(null);
    }
  }, [initial, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setValue("logoFile", f, { shouldDirty: true });
    setValue("removeLogo", false, { shouldDirty: true });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const handleRemoveLogo = () => {
    setValue("logoFile", null, { shouldDirty: true });
    setValue("removeLogo", true, { shouldDirty: true });
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const btnText = isSubmitted ? "Update" : "Proceed";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="sponsorLabel"
    >
      <div className="rounded-2xl border border-gray-200 p-5 shadow-sm ">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                Scholarship details
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Give your scholarship a clear title, category, and optional
                brand logo.
              </p>
            </div>
          </div>

          {/* Title */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-800">
              Scholarship Title
            </label>
            <input
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
              placeholder="e.g., Marian Scholarship for Girls"
              {...register("title", { required: "Title is required" })}
            />
            {errors.title && (
              <p className="text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-800">
              Scholarship Category
            </label>
            <Controller
              control={control}
              name="category"
              rules={{ required: "Please pick a category" }}
              render={({ field, fieldState }) => (
                <>
                  <CreatableSelect
                    classNamePrefix="react-select"
                    placeholder="Select or type a category"
                    isClearable
                    isSearchable
                    options={CATEGORY_OPTS}
                    value={
                      CATEGORY_OPTS.find((o) => o.value === field.value) ||
                      toOption(field.value)
                    }
                    onChange={(opt) =>
                      field.onChange(
                        opt
                          ? ((opt as any).value as ScholarshipCategory)
                          : undefined
                      )
                    }
                    onCreateOption={(input) =>
                      field.onChange(input as ScholarshipCategory)
                    }
                    styles={{
                      control: (base, state) => ({
                        ...base,
                        borderRadius: 8,
                        borderColor: state.isFocused
                          ? "#d1d5db"
                          : base.borderColor,
                        boxShadow: state.isFocused
                          ? "0 0 0 4px rgba(0,0,0,0.04)"
                          : "none",
                        minHeight: 40,
                      }),
                      valueContainer: (b) => ({ ...b, padding: "2px 8px" }),
                      input: (b) => ({ ...b, fontSize: 14 }),
                      singleValue: (b) => ({ ...b, fontSize: 14 }),
                      placeholder: (b) => ({ ...b, fontSize: 14 }),
                      menu: (b) => ({
                        ...b,
                        borderRadius: 10,
                        overflow: "hidden",
                      }),
                    }}
                  />
                  {fieldState.error && (
                    <p className="mt-1 text-xs text-red-600">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Logo */}
          <div className="grid gap-2">
            <label className="text-sm font-medium text-gray-800">
              Scholarship Logo <span className="text-gray-400">(optional)</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Preview tile */}
              <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-white shadow-sm">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="New logo preview"
                    className="h-full w-full object-cover"
                  />
                ) : existingLogoUrl && !watch("removeLogo") ? (
                  <img
                    src={existingLogoUrl}
                    alt="Current logo"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                    No logo
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50">
                  Choose file
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {(existingLogoUrl || previewUrl) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 shadow-sm transition hover:bg-red-100"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Recommended: square image (e.g., 512×512), PNG/JPG. Max
              ~2–3&nbsp;MB.
            </p>

            {/* Keep removeLogo in form state */}
            <input type="hidden" {...register("removeLogo")} />
          </div>

          {!hideButtons && (
            <div className="pt-2">
              <button
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-gray-200"
                type="submit"
              >
                {btnText}
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
};

export default Step1Details;
