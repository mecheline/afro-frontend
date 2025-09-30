// src/features/scholarships/steps/Step1Details.tsx
import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import type { Scholarship, ScholarshipCategory } from "../../../../redux/services/scholar/api";

type FormVals = { title: string; category: ScholarshipCategory };

const CATEGORY_OPTS = [
  "Secondary",
  "WASSCE",
  "Undergraduate",
  "Masters",
  "PHD",
].map((v) => ({ value: v, label: v }));

const toOption = (v?: string) => (v ? { value: v, label: v } : null);

const Step1Details: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: Scholarship;
  isSubmitted?: boolean;
  onSubmit: (v: FormVals) => Promise<void> | void;
}> = ({ formId, hideButtons, initial, isSubmitted, onSubmit }) => {
  const { register, control, handleSubmit, reset } = useForm<FormVals>({
    defaultValues: { title: "", category: "Secondary" },
  });

  useEffect(() => {
    if (initial) {
      reset({
        title: initial.title,
        category: initial.category, // string in your API
      });
    }
  }, [initial, reset]);

  const btnText = isSubmitted ? "Update" : "Proceed";

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4 sponsorLabel">
      <div>
        <label className="block text-sm font-medium">Scholarship Title</label>
        <input
          className="mt-1 w-full rounded-md border p-2"
          placeholder="e.g. Marian Scholarship for girls"
          {...register("title", { required: true })}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">
          Scholarship Category
        </label>
        <Controller
          control={control}
          name="category"
          rules={{ required: "Please pick a category" }}
          render={({ field, fieldState }) => (
            <>
              <CreatableSelect
                isClearable
                isSearchable
                placeholder="Select or type a category"
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
              />
              {fieldState.error && (
                <p className="mt-1 text-sm text-red-600">
                  {fieldState.error.message}
                </p>
              )}
            </>
          )}
        />
      </div>

      {!hideButtons && (
        <button className="w-full rounded-md bg-blue-600 p-3 text-white">
          {btnText}
        </button>
      )}
    </form>
  );
};

export default Step1Details;
