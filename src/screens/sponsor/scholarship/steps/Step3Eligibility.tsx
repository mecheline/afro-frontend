// src/features/scholarships/steps/Step3Eligibility.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { useLazyGetFieldsQuery } from "../../../../redux/services/scholar/api";

type FormVals = {
  description: string;
  minimumQualifications: string;
  fieldOfStudy: string; // human label (visible to sponsors)
  fieldOfStudyKey?: string; // canonical key (for robust matching)
  recipients: number;
};

type CatalogRow = { key: string; label: string; variants?: string[] };
type Opt = {
  value: string;
  label: string;
  metaKey?: string;
  metaLabel?: string;
};

const QUALIFICATIONS: string[] = [
  "Certificate",
  "Diploma",
  "Bachelors",
  "Masters",
  "Doctorate",
];

const toOption = (v?: string | null) => (v ? { value: v, label: v } : null);

const Step3Eligibility: React.FC<{
  formId?: string;
  hideButtons?: boolean;
  initial?: Partial<FormVals>;
  isSubmitted?: boolean;
  onBack: () => void;
  onSubmit: (v: FormVals) => Promise<void> | void;
}> = ({ formId, hideButtons, initial, isSubmitted, onBack, onSubmit }) => {
  const { register, control, handleSubmit, reset, watch, setValue } =
    useForm<FormVals>({
      defaultValues: {
        description: "",
        minimumQualifications: "",
        fieldOfStudy: "",
        fieldOfStudyKey: "",
        recipients: 1,
      },
    });

  // ---------------- Catalog query (Fields of Study) ----------------
  const [search, setSearch] = useState("");
  const [triggerGetFields, { data: fieldRows, isFetching }] =
    useLazyGetFieldsQuery();

  // debounce search → API
  useEffect(() => {
    const t = setTimeout(
      () => triggerGetFields({ q: search || undefined }),
      250
    );
    return () => clearTimeout(t);
  }, [search, triggerGetFields]);

  // Build options out of catalog rows:
  //   - show VARIANTS as the selectable labels (nice UX)
  //   - attach metaKey/metaLabel so we can store canonical key & label
  const fosOptions: Opt[] = useMemo(() => {
    const rows: CatalogRow[] = fieldRows ?? [];
    const opts: Opt[] = [];

    rows.forEach((r) => {
      const visible =
        Array.isArray(r.variants) && r.variants.length > 0
          ? r.variants
          : [r.label];

      visible.forEach((variant) => {
        const v = (variant || "").trim();
        if (!v) return;
        opts.push({
          value: r.key, // value = canonical key
          label: v, // label = visible/variant
          metaKey: r.key,
          metaLabel: r.label, // canonical catalog label
        });
      });
    });

    // Ensure current selection is present even if it isn't in the current filtered results
    const currentKey = watch("fieldOfStudyKey") || "";
    const currentVariant = watch("fieldOfStudy") || "";
    if (
      currentVariant &&
      !opts.some(
        (o) =>
          (o.metaKey || o.value) === currentKey &&
          o.label.toLowerCase() === currentVariant.toLowerCase()
      )
    ) {
      opts.push({
        value: currentKey,
        label: currentVariant,
        metaKey: currentKey,
        metaLabel: watch("fieldOfStudy") || currentVariant,
      });
    }

    return opts;
  }, [fieldRows, watch]);

  // ---------------- Prefill (edit mode) ----------------
  useEffect(() => {
    if (!initial) return;
    reset({
      description: initial.description ?? "",
      minimumQualifications: initial.minimumQualifications ?? "",
      fieldOfStudy: initial.fieldOfStudy ?? "",
      fieldOfStudyKey: initial.fieldOfStudyKey ?? "",
      recipients: initial.recipients ?? 1,
    });
  }, [initial, reset]);

  const qualificationOptions = useMemo(
    () =>
      Array.from(new Set(QUALIFICATIONS)).map((q) => ({ value: q, label: q })),
    []
  );

  const primaryBtnText = isSubmitted ? "Update" : "Proceed";

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sponsorLabel"
    >
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

      {/* Minimum Qualification */}
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
                onCreateOption={(inputValue) => field.onChange(inputValue)}
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

      {/* Field of Study (catalog-driven: save key + label) */}
      <div>
        <label className="mb-1 block text-sm font-medium">Field of study</label>
        <Controller
          control={control}
          name="fieldOfStudyKey"
          rules={{}}
          render={({ field }) => {
            const currentVariant = watch("fieldOfStudy") || "";
            const currentOpt =
              fosOptions.find(
                (o) =>
                  (o.metaKey || o.value) === field.value &&
                  o.label.toLowerCase() === currentVariant.toLowerCase()
              ) ||
              fosOptions.find((o) => (o.metaKey || o.value) === field.value) ||
              null;

            return (
              <>
                <CreatableSelect
                  isClearable
                  isSearchable
                  isLoading={isFetching}
                  placeholder="Search or type a field of study"
                  options={fosOptions}
                  value={currentOpt}
                  onInputChange={(input, meta) => {
                    if (meta.action === "input-change") setSearch(input);
                  }}
                  onChange={(opt) => {
                    if (!opt) {
                      field.onChange(""); // clear key
                      setValue("fieldOfStudy", ""); // clear label
                      return;
                    }
                    const o = Array.isArray(opt)
                      ? (opt[0] as Opt)
                      : (opt as unknown as Opt);
                    // Save canonical key + visible label
                    field.onChange(o.metaKey || o.value || "");
                    setValue("fieldOfStudy", o.label, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  onCreateOption={(inputValue) => {
                    // Custom entry → no key, just label
                    const custom = (inputValue || "").trim();
                    field.onChange(""); // key = ""
                    setValue("fieldOfStudy", custom, {
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                />
                {/* Keep label in form state (visible & used in backend) */}
                <input type="hidden" {...register("fieldOfStudy")} />
              </>
            );
          }}
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
