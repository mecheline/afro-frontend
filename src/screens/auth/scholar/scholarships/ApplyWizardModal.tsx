import * as React from "react";
import { Dialog } from "@headlessui/react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import {
  useGetAccountQuery,
  useCreateApplicationMutation,
  type ScholarshipItem,
} from "../../../../redux/services/scholar/api";
import { toast } from "sonner";

/** ---------- env ---------- */
const UPLOAD_BASE = import.meta.env.VITE_API_BASE_URL as string;

/** ---------- helpers ---------- */
const cn = (...x: Array<string | false | null | undefined>) =>
  x.filter(Boolean).join(" ");

const DEGREES = ["WASSCE", "Undergraduate", "Masters", "PHD"].map((v) => ({
  value: v,
  label: v,
}));

const toOption = (v?: string | null) => (v ? { value: v, label: v } : null);
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const pickUploadUrl = (json: any) =>
  json?.url ?? json?.data?.url ?? json?.secure_url ?? null;

async function uploadOne(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const resp = await fetch(`${UPLOAD_BASE}/utilities/api/upload`, {
    method: "POST",
    body: fd,
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Upload failed: ${resp.status} ${text}`);
  }
  const j = await resp.json();
  const url = pickUploadUrl(j);
  if (!url) throw new Error("Upload succeeded but no URL in response");
  return url;
}

/** ---------- form types ---------- */
type Step1 = {
  fullName: string;
  email: string;
  phone: string;
  dob: string;
  gender: string;
};
type Step2 = {
  employmentStatus: string;
  currentDegree: string;
  cgpa: string;
};
type Step3 = {
  docs: Record<string, any>; // docs.personal.<slug> : File, docs.educational.<slug> : File
};
type Step4 = {
  cv: File | null;
  motivation: string;
};
export type ApplyForm = Step1 & Step2 & Step3 & Step4;

/** ---------- UI bits ---------- */
const Stepper: React.FC<{ idx: number; total: number; labels: string[] }> = ({
  idx,
  total,
  labels,
}) => (
  <div className="mb-3">
    <div className="mb-1 text-sm text-indigo-600">
      {labels[idx]}{" "}
      <span className="text-gray-400">
        {idx + 1}/{total}
      </span>
    </div>
    <div className="flex gap-2">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-1 flex-1 rounded-full",
            i <= idx ? "bg-indigo-600" : "bg-gray-200"
          )}
        />
      ))}
    </div>
  </div>
);

/** Custom file button with icon + filename chip */
const UploadField: React.FC<{
  label: string;
  value: File | null | undefined;
  onChange: (f: File | null) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}> = ({ label, value, onChange, required, disabled, error }) => {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  return (
    <div>
      <label className="mb-1 block text-sm font-medium">
        {label} {required && <span className="text-red-600">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            className="opacity-80"
          >
            <path
              fill="currentColor"
              d="M9 16h6v-6h4l-7-7l-7 7h4v6m-6 2h18v2H3z"
            />
          </svg>
          Upload
        </button>
        {value ? (
          <div className="flex items-center gap-2 rounded-md bg-gray-50 px-2 py-1 text-xs">
            <span className="truncate max-w-[220px]">{value.name}</span>
            <button
              type="button"
              onClick={() => onChange(null)}
              className="rounded px-1.5 py-0.5 hover:bg-gray-200"
              title="Remove"
            >
              ×
            </button>
          </div>
        ) : (
          <span className="text-xs text-gray-500">No file selected</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

const stepLabels = [
  "Personal Information",
  "Current Status",
  "Documents",
  "Letters",
];

/** ---------- main modal ---------- */
const ApplyWizardModal: React.FC<{
  open: boolean;
  scholarship: ScholarshipItem;
  onClose: () => void;
}> = ({ open, scholarship, onClose }) => {
  const total = 4;
  const [idx, setIdx] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);

  const { data: acct } = useGetAccountQuery({});
  const [createApplication, { isLoading: submitting }] =
    useCreateApplicationMutation();

  const methods = useForm<ApplyForm>({
    mode: "onSubmit",
    shouldUnregister: false, // keep file objects & other values when steps unmount
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dob: "",
      gender: "",
      employmentStatus: "",
      currentDegree: "",
      cgpa: "",
      docs: {},
      cv: null,
      motivation: "",
    },
  });

  const {
    register,
    control,
    handleSubmit,
    getValues,
    reset,
    trigger,
    formState: { errors },
  } = methods;

  console.log(acct);

  /** Prefill Step 1 (and some Step 2) robustly */
  React.useEffect(() => {
    if (!acct) return;

    // Prefer nested profile if present, else fall back to top-level fields
    const prof = (acct as any).profile?.profile || (acct as any).profile || {};
    const p = prof.personal || {};
    const contact = prof.contact || {};
    const demo = prof.demographics || {};
    const tertiary = prof.education?.tertiary || {};

    const fullName = [
      p.firstName ?? acct.firstName,
      p.middleName,
      p.lastName ?? acct.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    const dobSrc = p.dateOfBirth ?? acct.dateOfBirth;
    const dob = dobSrc ? new Date(dobSrc).toISOString().slice(0, 10) : "";
    const gender = demo.gender ?? acct.gender ?? "";
    const phone = contact.preferredPhone ?? acct.phone ?? "";

    reset(
      {
        ...getValues(),
        fullName: fullName || "",
        email: (acct as any)?.profile?.email || "",
        phone,
        dob,
        gender,
        employmentStatus: (acct as any)?.profile?.employmentStatus || "",
        currentDegree: tertiary.minQualification || "",
        cgpa: tertiary.cgpa || "",
      },
      { keepDirtyValues: true, keepTouched: true }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acct, reset]);

  const busy = uploading || submitting;

  // Dynamic required document keys for validation gating
  const personalReqs = scholarship.documents?.personal ?? [];
  const educationalReqs = scholarship.documents?.educational ?? [];
  const personalKeys = personalReqs.map(
    (label) => `docs.personal.${slug(label)}`
  );
  const educationalKeys = educationalReqs.map(
    (label) => `docs.educational.${slug(label)}`
  );
  const allDocKeys = [...personalKeys, ...educationalKeys];

  // Step-by-step required fields
  const stepFields: string[][] = [
    ["fullName", "email", "phone", "dob", "gender"],
    ["employmentStatus", "currentDegree", "cgpa"],
    allDocKeys,
    ["cv", "motivation"], // motivation required as requested
  ];

  const back = () => setIdx((i) => Math.max(0, i - 1));
  const next = async () => {
    // validate current step before advancing
    const ok = await trigger(stepFields[idx] as any, { shouldFocus: true });
    if (!ok) return;
    setIdx((i) => Math.min(total - 1, i + 1));
  };

  /** Submit → upload files, build JSON payload, send */
  const onSubmit = handleSubmit(async (values) => {
    // safety: validate last step too
    const ok = await trigger(stepFields[idx] as any, { shouldFocus: true });
    if (!ok) return;

    try {
      setUploading(true);

      // CV upload
      let cvUrl: string | undefined;
      if (values.cv instanceof File) cvUrl = await uploadOne(values.cv);

      // Collect docs from nested structure
      const personal = (values.docs as any)?.personal ?? {};
      const educational = (values.docs as any)?.educational ?? {};
      const pairs: [string, File][] = [];
      for (const [k, v] of Object.entries(personal)) {
        if (v instanceof File) pairs.push([`personal.${k}`, v]);
      }
      for (const [k, v] of Object.entries(educational)) {
        if (v instanceof File) pairs.push([`educational.${k}`, v]);
      }

      // Upload all doc files in parallel
      const urls = await Promise.all(pairs.map(([, f]) => uploadOne(f)));

      // Build url maps
      const docsPersonal: Record<string, string> = {};
      const docsEducational: Record<string, string> = {};
      pairs.forEach(([key], i) => {
        const url = urls[i];
        if (key.startsWith("personal.")) {
          docsPersonal[key.replace(/^personal\./, "")] = url;
        } else {
          docsEducational[key.replace(/^educational\./, "")] = url;
        }
      });

      // Final JSON payload
      const payload = {
        scholarshipId: scholarship._id,
        applicant: {
          fullName: values.fullName,
          email: values.email,
          phone: values.phone,
          dob: values.dob,
          gender: values.gender,
        },
        status: {
          employmentStatus: values.employmentStatus,
          currentDegree: values.currentDegree,
          cgpa: values.cgpa,
        },
        documents: { personal: docsPersonal, educational: docsEducational },
        letters: { cvUrl, motivation: values.motivation },
      };

      const res = await createApplication(payload as any).unwrap();
      console.log(res);
      toast.success(res?.msg);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Upload or submission failed. Please try again.");
    } finally {
      setUploading(false);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={() => !busy && onClose()}
      className="dialog relative z-50"
    >
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 overflow-y-auto p-4">
        <div className="mx-auto max-w-xl">
          <Dialog.Panel className="rounded-2xl bg-white p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <Dialog.Title className="text-lg font-semibold">
                Apply
              </Dialog.Title>
              <button
                onClick={onClose}
                disabled={busy}
                className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                Close
              </button>
            </div>

            <Stepper idx={idx} total={4} labels={stepLabels} />

            <FormProvider {...methods}>
              <form onSubmit={onSubmit} className="space-y-4">
                {/* STEP 1 */}
                {idx === 0 && (
                  <>
                    <div>
                      <label className="block text-sm font-medium">
                        Full Name
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                        {...register("fullName", {
                          required: "Full name is required",
                        })}
                      />
                      {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.fullName.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">Email</label>
                      <input
                        type="email"
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                        {...register("email", {
                          required: "Email is required",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message: "Enter a valid email",
                          },
                        })}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.email.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        Phone Number
                      </label>
                      <input
                        className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                        {...register("phone", {
                          required: "Phone is required",
                        })}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.phone.message)}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                          {...register("dob", {
                            required: "Date of birth is required",
                          })}
                        />
                        {errors.dob && (
                          <p className="mt-1 text-sm text-red-600">
                            {String(errors.dob.message)}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium">
                          Gender
                        </label>
                        <select
                          className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2"
                          {...register("gender", {
                            required: "Gender is required",
                          })}
                        >
                          <option value="">Select</option>
                          <option>Male</option>
                          <option>Female</option>
                          <option>Other</option>
                        </select>
                        {errors.gender && (
                          <p className="mt-1 text-sm text-red-600">
                            {String(errors.gender.message)}
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}

                {/* STEP 2 */}
                {idx === 1 && (
                  <>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Employment status
                      </label>
                      <select
                        className="w-full rounded-md border border-gray-200 px-3 py-2"
                        {...register("employmentStatus", {
                          required: "Employment status is required",
                        })}
                      >
                        <option value="">Select</option>
                        <option>Unemployed</option>
                        <option>Part-time</option>
                        <option>Full-time</option>
                        <option>Others</option>
                      </select>
                      {errors.employmentStatus && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.employmentStatus.message)}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Current degree
                      </label>
                      <Controller
                        control={control}
                        name="currentDegree"
                        rules={{ required: "Current degree is required" }}
                        render={({ field, fieldState }) => (
                          <>
                            <CreatableSelect
                              isClearable
                              isSearchable
                              options={DEGREES}
                              value={
                                DEGREES.find((o) => o.value === field.value) ||
                                toOption(field.value)
                              }
                              onChange={(opt: any) =>
                                field.onChange(opt ? opt.value : "")
                              }
                              onCreateOption={(v) => field.onChange(v)}
                              placeholder="Select or type degree"
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

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        CGPA
                      </label>
                      <input
                        className="w-full rounded-md border border-gray-200 px-3 py-2"
                        {...register("cgpa", { required: "CGPA is required" })}
                      />
                      {errors.cgpa && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.cgpa.message)}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* STEP 3 */}
                {idx === 2 && (
                  <>
                    {personalReqs.length > 0 && (
                      <fieldset className="rounded-xl border border-gray-200 p-3">
                        <legend className="px-1 text-sm font-semibold">
                          Personal Documents
                        </legend>
                        <div className="grid gap-3">
                          {personalReqs.map((label) => {
                            const key = `docs.personal.${slug(label)}`;
                            return (
                              <Controller
                                key={key}
                                control={control}
                                name={key as any}
                                rules={{ required: `${label} is required` }}
                                render={({ field, fieldState }) => (
                                  <UploadField
                                    label={label}
                                    required
                                    disabled={busy}
                                    value={field.value as File | null}
                                    onChange={(f) => field.onChange(f)}
                                    error={fieldState.error?.message}
                                  />
                                )}
                              />
                            );
                          })}
                        </div>
                      </fieldset>
                    )}

                    {educationalReqs.length > 0 && (
                      <fieldset className="rounded-xl border border-gray-200 p-3">
                        <legend className="px-1 text-sm font-semibold">
                          Educational Documents
                        </legend>
                        <div className="grid gap-3">
                          {educationalReqs.map((label) => {
                            const key = `docs.educational.${slug(label)}`;
                            return (
                              <Controller
                                key={key}
                                control={control}
                                name={key as any}
                                rules={{ required: `${label} is required` }}
                                render={({ field, fieldState }) => (
                                  <UploadField
                                    label={label}
                                    required
                                    disabled={busy}
                                    value={field.value as File | null}
                                    onChange={(f) => field.onChange(f)}
                                    error={fieldState.error?.message}
                                  />
                                )}
                              />
                            );
                          })}
                        </div>
                      </fieldset>
                    )}
                  </>
                )}

                {/* STEP 4 */}
                {idx === 3 && (
                  <>
                    <Controller
                      control={control}
                      name="cv"
                      rules={{ required: "CV is required" }}
                      render={({ field, fieldState }) => (
                        <UploadField
                          label="Upload CV / Resume"
                          required
                          disabled={busy}
                          value={field.value as File | null}
                          onChange={(f) => field.onChange(f)}
                          error={fieldState.error?.message}
                        />
                      )}
                    />

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Motivation Letter
                      </label>
                      <textarea
                        rows={5}
                        className="w-full rounded-md border border-gray-200 px-3 py-2"
                        placeholder="Write a short motivation letter…"
                        {...register("motivation", {
                          required: "Motivation letter is required",
                        })}
                        disabled={busy}
                      />
                      {errors.motivation && (
                        <p className="mt-1 text-sm text-red-600">
                          {String(errors.motivation.message)}
                        </p>
                      )}
                    </div>
                  </>
                )}

                {/* Footer buttons */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={idx === 0 ? onClose : back}
                    disabled={busy}
                    className="rounded-md border px-4 py-2 disabled:opacity-50"
                  >
                    {idx === 0 ? "Cancel" : "Back"}
                  </button>
                  {idx < total - 1 ? (
                    <button
                      type="button"
                      onClick={next}
                      disabled={busy}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={busy}
                      className="rounded-md bg-indigo-600 px-4 py-2 text-white disabled:opacity-50"
                    >
                      {busy ? "Submitting…" : "Submit"}
                    </button>
                  )}
                </div>
              </form>
            </FormProvider>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  );
};

export default ApplyWizardModal;
