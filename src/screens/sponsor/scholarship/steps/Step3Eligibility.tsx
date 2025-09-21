// src/features/scholarships/steps/Step3Eligibility.tsx
import React, { useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";

type FormVals = {
  description: string;
  minimumQualifications: string; // single value
  fieldOfStudy: string; // single value
  recipients: number;
};

const QUALIFICATIONS = [
  "Certificate",
  "Diploma",
  "OND",
  "HND",
  "Bachelors",
  "Postgraduate Diploma",
  "Masters",
  "MPhil",
  "Doctorate / PhD",
].map((q) => ({ value: q, label: q }));

// A compact but broad set. Add/remove to taste.
// If you ever need a huge list, you can source it into a separate constants file.
const FIELDS = [
  "Accounting",
  "Agricultural Science",
  "Architecture",
  "Biochemistry",
  "Biology",
  "Biomedical Engineering",
  "Business Administration",
  "Chemical Engineering",
  "Chemistry",
  "Civil Engineering",
  "Computer Engineering",
  "Computer Science",
  "Criminology",
  "Data Science",
  "Dentistry",
  "Economics",
  "Education",
  "Electrical/Electronic Engineering",
  "English",
  "Environmental Science",
  "Finance",
  "Geography",
  "Geology",
  "History",
  "Human Resource Management",
  "Information Systems",
  "Information Technology",
  "International Relations",
  "Law",
  "Linguistics",
  "Management",
  "Marketing",
  "Mass Communication",
  "Mathematics",
  "Mechanical Engineering",
  "Mechatronics",
  "Medicine & Surgery",
  "Microbiology",
  "Nursing",
  "Petroleum Engineering",
  "Pharmacy",
  "Philosophy",
  "Physics",
  "Physiology",
  "Political Science",
  "Project Management",
  "Psychology",
  "Public Administration",
  "Public Health",
  "Quantity Surveying",
  "Sociology",
  "Software Engineering",
  "Statistics",
  "Theatre Arts",
  "Urban & Regional Planning",
].map((c) => ({ value: c, label: c }));

// helper: turn a string into an Option (for custom values)
const toOption = (v?: string | null) => (v ? { value: v, label: v } : null);

const Step3Eligibility: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: Partial<FormVals>;
  isSubmitted?: boolean; // to toggle Proceed/Update label
  onBack: () => void;
  onSubmit: (v: FormVals) => Promise<void> | void;
}> = ({formId, hideButtons, initial, isSubmitted, onBack, onSubmit }) => {
  const { register, control, handleSubmit, reset, setValue, watch } =
    useForm<FormVals>({
      defaultValues: {
        description: "",
        minimumQualifications: "",
        fieldOfStudy: "",
        recipients: 1,
      },
    });

  // Prefill on edit
  useEffect(() => {
    if (!initial) return;
    reset({
      description: initial.description ?? "",
      minimumQualifications: initial.minimumQualifications ?? "",
      fieldOfStudy: initial.fieldOfStudy ?? "",
      recipients: initial.recipients ?? 1,
    });
  }, [initial, reset]);

  const primaryBtnText = isSubmitted ? "Update" : "Proceed";

  // Memoized options (not required, but avoids re-allocs)
  const qualificationOptions = useMemo(() => QUALIFICATIONS, []);
  const fieldOptions = useMemo(() => FIELDS, []);

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Description */}
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          className="mt-1 w-full rounded-md border p-2"
          rows={4}
          placeholder="Briefly describe this scholarship or who should apply"
          {...register("description")}
        />
      </div>

      {/* Minimum Qualification (Creatable + Searchable) */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Minimum qualification
        </label>
        <Controller
          control={control}
          name="minimumQualifications"
          rules={{ required: "Please choose or enter a qualification" }}
          render={({ field, fieldState }) => (
            <>
              <CreatableSelect
                isClearable
                isSearchable
                placeholder="Select or type a qualification (e.g., Bachelors, HND)"
                options={qualificationOptions}
                value={
                  // show existing value, whether from list or custom
                  qualificationOptions.find((o) => o.value === field.value) ||
                  toOption(field.value)
                }
                onChange={(opt) =>
                  field.onChange(
                    opt
                      ? Array.isArray(opt)
                        ? opt[0].value
                        : (opt as any).value
                      : ""
                  )
                }
                onCreateOption={(inputValue) => {
                  // accept custom and set
                  field.onChange(inputValue);
                }}
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

      {/* Field of Study (Creatable + Searchable) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Field of study</label>
        <Controller
          control={control}
          name="fieldOfStudy"
          rules={{ required: "Please choose or enter a field of study" }}
          render={({ field, fieldState }) => (
            <>
              <CreatableSelect
                isClearable
                isSearchable
                placeholder="Select or type a field of study (e.g., Computer Science)"
                options={fieldOptions}
                value={
                  fieldOptions.find((o) => o.value === field.value) ||
                  toOption(field.value)
                }
                onChange={(opt) =>
                  field.onChange(
                    opt
                      ? Array.isArray(opt)
                        ? opt[0].value
                        : (opt as any).value
                      : ""
                  )
                }
                onCreateOption={(inputValue) => {
                  field.onChange(inputValue);
                }}
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

      {/* Recipients */}
      <div>
        <label className="block text-sm font-medium">
          Number of recipients
        </label>
        <input
          type="number"
          className="mt-1 w-full rounded-md border p-2"
          min={1}
          {...register("recipients", { valueAsNumber: true, min: 1 })}
        />
      </div>

      {/* Actions */}
      {!hideButtons && (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border p-3"
          >
            Back
          </button>
          <button className="rounded-md bg-blue-600 p-3 text-white">
            {primaryBtnText}
          </button>
        </div>
      )}
    </form>
  );
};

export default Step3Eligibility;
