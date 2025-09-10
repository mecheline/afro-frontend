// ResultsCertificationsRHF.tsx
import React, { useRef, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  ArrowLeft,
  FileText,
  X,
  UploadCloud,
  CheckCircle2,
  Plus,
} from "lucide-react";

const UPLOAD_ENDPOINT = import.meta.env.VITE_API_BASE_URL;

type NamedUpload = { label: string; file: File | null; url?: string };

type FormValues = {
  wasce: File | null;
  wasceUrl?: string;

  ssce: File | null;
  ssceUrl?: string;

  primary: File | null;
  primaryUrl?: string;

  others: NamedUpload[];
};

type SavePayload = {
  wasce: string; // URL or ""
  ssce: string; // URL or ""
  primary: string; // URL or ""
  others: { label: string; url: string }[]; // label + URL only
};

const formatSize = (f?: File | null) =>
  !f ? "" : `${Math.max(1, Math.round(f.size / 1024))} Kb`;

const RowCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  children,
  className = "",
}) => (
  <div
    className={`flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ${className}`}
  >
    {children}
  </div>
);

const ResultsCertificationsRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onSave?: (values: SavePayload) => Promise<void> | void;
  isSaving?: boolean;
  /** Optional: override upload endpoint */
  uploadUrl?: string; // default: "/api/upload"
}> = ({
  initialData,
  onPrev,
  onSave,
  isSaving,
  uploadUrl = `${UPLOAD_ENDPOINT}/utilities/api/upload`,
}) => {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm<FormValues>({
      defaultValues: {
        wasce: null,
        ssce: null,
        primary: null,
        others: [{ label: "", file: null, url: "" }],
        ...initialData,
      },
      mode: "onTouched",
    });

  const { fields, append, remove } = useFieldArray({ control, name: "others" });

  // hidden pickers
  const wasceRef = useRef<HTMLInputElement | null>(null);
  const ssceRef = useRef<HTMLInputElement | null>(null);
  const primaryRef = useRef<HTMLInputElement | null>(null);
  const otherRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // watch files + urls
  const wasce = watch("wasce");
  const wasceUrl = watch("wasceUrl");
  const ssce = watch("ssce");
  const ssceUrl = watch("ssceUrl");
  const primary = watch("primary");
  const primaryUrl = watch("primaryUrl");
  const others = watch("others");

  // per-item uploading flags
  const [uploading, setUploading] = useState<{
    wasce?: boolean;
    ssce?: boolean;
    primary?: boolean;
    others?: Record<number, boolean>;
  }>({ others: {} });

  const onPick =
    (name: keyof FormValues | `others.${number}.file`) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] || null;
      setValue(name as any, f, { shouldDirty: true });
      // reset input for same-file reselect
      e.currentTarget.value = "";
    };

  async function uploadFileToServer(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(uploadUrl, { method: "POST", body: fd });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || !json?.url) {
      throw new Error(json?.msg || "Upload failed");
    }
    return json.url as string;
  }

  async function handleUpload(kind: "wasce" | "ssce" | "primary") {
    const file = { wasce, ssce, primary }[kind] as File | null;
    if (!file) return;
    try {
      setUploading((u) => ({ ...u, [kind]: true }));
      const url = await uploadFileToServer(file);
      const urlKey =
        kind === "wasce"
          ? "wasceUrl"
          : kind === "ssce"
          ? "ssceUrl"
          : "primaryUrl";
      setValue(urlKey as keyof FormValues, url, { shouldDirty: true });
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading((u) => ({ ...u, [kind]: false }));
    }
  }

  async function handleUploadOther(i: number) {
    const file = others?.[i]?.file as File | null;
    if (!file) return;
    try {
      setUploading((u) => ({
        ...u,
        others: { ...(u.others || {}), [i]: true },
      }));
      const url = await uploadFileToServer(file);
      setValue(`others.${i}.url` as const, url, { shouldDirty: true });
    } catch (e: any) {
      alert(e?.message || "Upload failed");
    } finally {
      setUploading((u) => ({
        ...u,
        others: { ...(u.others || {}), [i]: false },
      }));
    }
  }

  const submit = handleSubmit(async (v) => {
    // build URL-only payload
    const payload: SavePayload = {
      wasce: v.wasceUrl || "",
      ssce: v.ssceUrl || "",
      primary: v.primaryUrl || "",
      others: (v.others || []).map((o) => ({
        label: o.label || "",
        url: o.url || "",
      })),
    };

    await onSave?.(payload);
  });

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
            Results &amp; Certifications
          </span>
        </button>
      </div>

      {/* Body */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* WASCE */}
        <section className="mt-6 space-y-3">
          <div className="text-lg font-semibold text-slate-700">WASCE</div>

          {wasce ? (
            <RowCard className="border-red-200 bg-red-50">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                  <FileText className="h-6 w-6 text-red-500" />
                </div>
                <div>
                  <div className="break-all text-base font-semibold text-slate-900">
                    {wasce.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatSize(wasce)}
                  </div>
                  {wasceUrl && (
                    <a
                      href={wasceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-sm text-green-700 underline"
                    >
                      Uploaded URL
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setValue("wasce", null, { shouldDirty: true })}
                  className="rounded-full p-1.5 text-red-500 hover:bg-red-100"
                  aria-label="Remove file"
                >
                  <X className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  disabled={uploading.wasce}
                  onClick={() => handleUpload("wasce")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                    wasceUrl
                      ? "bg-green-50 text-green-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } disabled:opacity-70`}
                  title={wasceUrl ? "Re-upload" : "Upload"}
                >
                  {wasceUrl ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Uploaded
                    </>
                  ) : uploading.wasce ? (
                    <>Uploading…</>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </RowCard>
          ) : (
            <>
              <button
                type="button"
                onClick={() => wasceRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
              >
                <UploadCloud className="h-5 w-5" />
                Select File
              </button>
              <input
                type="file"
                ref={wasceRef}
                accept="application/pdf,image/*"
                className="hidden"
                onChange={onPick("wasce")}
              />
            </>
          )}
        </section>

        {/* SSCE */}
        <section className="mt-8 space-y-3">
          <div className="text-lg font-semibold text-slate-700">SSCE</div>

          {ssce ? (
            <RowCard>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="break-all text-base font-semibold text-slate-900">
                    {ssce.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatSize(ssce)}
                  </div>
                  {ssceUrl && (
                    <a
                      href={ssceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-sm text-green-700 underline"
                    >
                      Uploaded URL
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setValue("ssce", null, { shouldDirty: true })}
                  className="rounded-full p-1.5 text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  disabled={uploading.ssce}
                  onClick={() => handleUpload("ssce")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                    ssceUrl
                      ? "bg-green-50 text-green-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } disabled:opacity-70`}
                >
                  {ssceUrl ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Uploaded
                    </>
                  ) : uploading.ssce ? (
                    <>Uploading…</>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </RowCard>
          ) : (
            <>
              <button
                type="button"
                onClick={() => ssceRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
              >
                <UploadCloud className="h-5 w-5" />
                Select File
              </button>
              <input
                type="file"
                ref={ssceRef}
                accept="application/pdf,image/*"
                className="hidden"
                onChange={onPick("ssce")}
              />
            </>
          )}
        </section>

        {/* Primary School Cert */}
        <section className="mt-8 space-y-3">
          <div className="text-lg font-semibold text-slate-700">
            Primary School Cert.
          </div>

          {primary ? (
            <RowCard>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                  <FileText className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <div className="break-all text-base font-semibold text-slate-900">
                    {primary.name}
                  </div>
                  <div className="text-sm text-slate-500">
                    {formatSize(primary)}
                  </div>
                  {primaryUrl && (
                    <a
                      href={primaryUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-0.5 block text-sm text-green-700 underline"
                    >
                      Uploaded URL
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setValue("primary", null, { shouldDirty: true })
                  }
                  className="rounded-full p-1.5 text-slate-600 hover:bg-slate-200/50"
                >
                  <X className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  disabled={uploading.primary}
                  onClick={() => handleUpload("primary")}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                    primaryUrl
                      ? "bg-green-50 text-green-700"
                      : "bg-indigo-600 text-white hover:bg-indigo-500"
                  } disabled:opacity-70`}
                >
                  {primaryUrl ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Uploaded
                    </>
                  ) : uploading.primary ? (
                    <>Uploading…</>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4" />
                      Upload
                    </>
                  )}
                </button>
              </div>
            </RowCard>
          ) : (
            <>
              <button
                type="button"
                onClick={() => primaryRef.current?.click()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
              >
                <UploadCloud className="h-5 w-5" />
                Select File
              </button>
              <input
                type="file"
                ref={primaryRef}
                accept="application/pdf,image/*"
                className="hidden"
                onChange={onPick("primary")}
              />
            </>
          )}
        </section>

        {/* Others */}
        <section className="mt-10 space-y-5">
          <div className="text-xl font-bold text-slate-900">Others</div>

          {fields.map((f, i) => {
            const fi = others?.[i]?.file as File | null;
            const url = others?.[i]?.url || "";
            return (
              <div key={f.id} className="space-y-3">
                <label className="mb-1 block text-base text-slate-700">
                  Name of Certificate
                </label>
                <input
                  {...register(`others.${i}.label` as const)}
                  placeholder="Enter"
                  className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                />

                {fi ? (
                  <RowCard>
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm">
                        <FileText className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <div className="break-all text-base font-semibold text-slate-900">
                          {fi.name}
                        </div>
                        <div className="text-sm text-slate-500">
                          {formatSize(fi)}
                        </div>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 block text-sm text-green-700 underline"
                          >
                            Uploaded URL
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setValue(`others.${i}.file` as const, null, {
                            shouldDirty: true,
                          })
                        }
                        className="rounded-full p-1.5 text-slate-600 hover:bg-slate-200/50"
                      >
                        <X className="h-5 w-5" />
                      </button>

                      <button
                        type="button"
                        disabled={!!uploading.others?.[i]}
                        onClick={() => handleUploadOther(i)}
                        className={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
                          url
                            ? "bg-green-50 text-green-700"
                            : "bg-indigo-600 text-white hover:bg-indigo-500"
                        } disabled:opacity-70`}
                      >
                        {url ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Uploaded
                          </>
                        ) : uploading.others?.[i] ? (
                          <>Uploading…</>
                        ) : (
                          <>
                            <UploadCloud className="h-4 w-4" />
                            Upload
                          </>
                        )}
                      </button>
                    </div>
                  </RowCard>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => otherRefs.current[i]?.click()}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
                    >
                      <UploadCloud className="h-5 w-5" />
                      Select File
                    </button>
                    <input
                      type="file"
                      accept="application/pdf,image/*"
                      ref={(el) => {
                        otherRefs.current[i] = el;
                      }}
                      className="hidden"
                      onChange={onPick(`others.${i}.file` as const)}
                    />
                  </>
                )}

                {fields.length > 1 && (
                  <button
                    type="button"
                    onClick={() => remove(i)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove this result
                  </button>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => append({ label: "", file: null, url: "" })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-indigo-200 bg-indigo-50 px-4 py-3 text-indigo-700 hover:bg-indigo-100"
          >
            <Plus className="h-4 w-4" />
            Add another result
          </button>
        </section>
        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-3 mt-8">
          <button
            type="button"
            onClick={submit}
            disabled={isSaving}
            className="h-12 rounded-2xl border-2 border-[#2F56D9] text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default ResultsCertificationsRHF;
