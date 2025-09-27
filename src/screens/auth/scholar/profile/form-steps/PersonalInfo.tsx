// PersonalInfoRHF.tsx
import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  Pencil,
  UploadCloud,
} from "lucide-react";
import { useGetAccountQuery } from "../../../../../redux/services/scholar/api";
import moment from "moment";
import { Req } from "../../../../../constants/Required";

type SuffixValue = "" | "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | "Prof";

type PersonalForm = {
  firstName: string;
  lastName: string;
  preferredName?: string;
  middleName?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  suffix?: string;
  formerMaterial?: "Yes" | "No";
  avatarUrl?: string;
};

const SUFFIXES: Exclude<SuffixValue, "">[] = [
  "Miss",
  "Ms",
  "Mrs",
  "Mr",
  "Dr",
  "Prof",
];

// TODO: change to your real upload endpoint
const UPLOAD_ENDPOINT = import.meta.env.VITE_API_BASE_URL;

const PersonalStepForm: React.FC<{
  initialData?: Partial<PersonalForm>;
  onNext: (values?: PersonalForm) => void; // navigate only
  onSave: (values: PersonalForm) => Promise<void>;
  isSaving: boolean;
}> = ({ initialData, onNext, onSave, isSaving }) => {
  const { data: accountInfo, isSuccess, refetch } = useGetAccountQuery({});
  console.log(accountInfo);

  const mapAccountToPersonalInfo = (account: any) => ({
    firstName: account?.profile?.firstName,
    lastName: account?.profile?.lastName,
    dateOfBirth: moment(account?.profile?.dateOfBirth).format("YYYY-MM-DD"),
    avatarUrl: account?.profile?.avatar?.url,
  });
  console.log(mapAccountToPersonalInfo(accountInfo));

  const {
    register,
    watch,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState,
  } = useForm<PersonalForm>({
    defaultValues: {
      firstName: "",
      preferredName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      formerMaterial: "Yes",
      dateOfBirth: "",
      avatarUrl: "", // important for placeholder + validation
      ...initialData,
    },
    mode: "onTouched",
  });
  const { errors } = formState;

  useEffect(() => {
    if (initialData) reset({ ...initialData });
  }, [initialData, reset]);

  console.log(initialData);

  /*  const submitSave = handleSubmit((values) => {
    onSave(values);
  }); */

  const submitSave = handleSubmit(async (values) => {
    try {
      await onSave(values);
      await refetch();

      // if avatarUrl is set (from upload step), update preview immediately
      if (values.avatarUrl) {
        setPreview(values.avatarUrl); // switch from blob to CDN url
      }
    } catch (err) {
      console.error(err);
    }
  });

  const suffix = watch("suffix");
  const isPlaceholder = !suffix;

  // Avatar state
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null); // blob URL or uploaded CDN URL
  const [uploading, setUploading] = useState(false);

  /* useEffect(() => {
    if (accountInfo && !formState.isDirty) {
      reset(mapAccountToPersonalInfo(accountInfo));
      setPreview(accountInfo?.profile?.avatar?.url);
    }
  }, [isSuccess, formState.isDirty, reset]); */

  useEffect(() => {
    if (accountInfo && !formState.isDirty) {
      const mapped = mapAccountToPersonalInfo(accountInfo);
      reset(mapped);

      if (mapped.avatarUrl) {
        setPreview(mapped.avatarUrl); // show CDN URL immediately
      }
    }
  }, [isSuccess, formState.isDirty, reset, accountInfo]);

  // Clean up blob URLs
  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const pickAvatar = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    // revoke old blob
    if (preview?.startsWith("blob:")) URL.revokeObjectURL(preview);

    setSelectedFile(f);
    const blobUrl = URL.createObjectURL(f);
    setPreview(blobUrl);

    // clear previously uploaded URL (force re-upload)
    setValue("avatarUrl", "", { shouldDirty: true, shouldValidate: true });
    if (fileRef.current) fileRef.current.value = "";
  };

  const uploadSelected = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", selectedFile); // <-- field name must match your backend

      const res = await fetch(`${UPLOAD_ENDPOINT}/utilities/api/upload`, {
        method: "POST",
        body: form,
        // headers: { Authorization: `Bearer ${token}` }, // if protected
      });
      if (!res.ok) throw new Error(await res.text());

      const data: { msg: string; url: string; status: string } =
        await res.json();

      console.log(data);
      setValue("avatarUrl", data.url, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setPreview((old) => {
        if (old?.startsWith("blob:")) URL.revokeObjectURL(old);
        return data.url; // switch from blob to CDN URL
      });
    } catch (e) {
      console.error(e);
      alert("Image upload failed. Please try again.");
      setValue("avatarUrl", "", { shouldValidate: true });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="mx-auto w-full pt-4 sm:pt-6">
        <button
          className="inline-flex items-center gap-3 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <span className="text-2xl font-extrabold text-slate-900">
            Personal Info
          </span>
        </button>
      </div>

      {/* Page content */}
      <main className="mx-auto w-full sm:px-6 pb-16">
        {/* Avatar block */}
        <div className="mt-2 mb-2 flex flex-col items-center">
          <div className="relative">
            <div className="grid h-30 w-30 place-items-center overflow-hidden rounded-full bg-slate-100">
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-slate-300">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-20 w-20"
                    fill="currentColor"
                  >
                    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM2 20a10 10 0 0 1 20 0H2Z" />
                  </svg>
                </div>
              )}
            </div>

            {/* EDIT overlay (choose file) */}
            <button
              type="button"
              onClick={pickAvatar}
              disabled={uploading}
              className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-xl bg-[#2F56D9] text-white shadow-md disabled:opacity-60"
              aria-label="Choose picture"
              title="Choose picture"
            >
              <Pencil className="h-4 w-4" />
            </button>

            {/* hidden input for file picker */}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>

          {/* UPLOAD button below image */}
          <div className="mt-3">
            <button
              type="button"
              onClick={uploadSelected}
              disabled={!selectedFile || uploading}
              className="inline-flex items-center gap-2 rounded-xl bg-[#2F56D9] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#274bc4] disabled:opacity-60"
              aria-label="Upload picture"
              title={!selectedFile ? "Choose a file first" : "Upload to server"}
            >
              <UploadCloud className="h-4 w-4" />
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* Optional helper/status text */}
          <p className="mt-2 text-xs text-slate-500">
            {selectedFile
              ? selectedFile.name
              : "Choose a photo, then click Upload."}
          </p>
        </div>

        {/* RHF binding for avatar URL (required) */}
        <input
          type="hidden"
          {...register("avatarUrl", { required: "Profile photo is required" })}
        />
        <p
          className={`mt-1 text-center h-5 text-sm ${
            errors.avatarUrl ? "text-red-600" : "invisible"
          }`}
        >
          {errors.avatarUrl?.message || "placeholder"}
        </p>

        {/* Form */}
        <form
          id="personalInfoForm"
          onSubmit={submitSave}
          className="space-y-5 px-4 md:px-0"
        >
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* First Name */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Legal First Name <Req />
              </label>
              <input
                {...register("firstName", {
                  required: "First name is required",
                })}
                className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base font-semibold text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.firstName
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
                placeholder="Marian"
              />
              <p
                className={`mt-1 h-5 text-sm ${
                  errors.firstName ? "text-red-600" : "invisible"
                }`}
              >
                {errors.firstName?.message || "placeholder"}
              </p>
            </div>

            {/* Preferred Name */}
            <div className="flex-1">
              <div className="mb-2 flex items-end justify-between">
                <label className="block text-base text-slate-700">
                  Do you have a different Name People Call You
                </label>
                <span className="text-sm italic text-slate-400">
                  (Optional)
                </span>
              </div>
              <input
                {...register("preferredName")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold text-slate-900 shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="Joeyet"
              />
              <p className="mt-1 h-5 text-sm invisible">placeholder</p>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
            {/* Middle Name */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Middle Name
              </label>
              <input
                {...register("middleName")}
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base placeholder:text-slate-400 shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                placeholder="Middle Name"
              />
              <p className="mt-1 h-5 text-sm invisible">placeholder</p>
            </div>

            {/* Family Surname */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Family Surname <Req />
              </label>
              <input
                {...register("lastName", {
                  required: "Family surname is required",
                })}
                className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 text-base font-semibold text-slate-900 shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.lastName
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
                placeholder="Adeniran"
              />
              <p
                className={`mt-1 h-5 text-sm ${
                  errors.lastName ? "text-red-600" : "invisible"
                }`}
              >
                {errors.lastName?.message || "placeholder"}
              </p>
            </div>
          </div>

          {/* Row 3 */}
          <div className="flex flex-col md:flex-row gap-5 items-start">
            {/* Suffix */}
            <div className="w-full md:w-auto">
              <label
                htmlFor="suffix"
                className="mb-2 block text-base text-slate-700"
              >
                Suffix <Req />
              </label>
              <div className="relative">
                <select
                  id="suffix"
                  {...register("suffix", { required: "Select a suffix" })}
                  className={`h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10
                    text-base font-semibold shadow-sm appearance-none [&::-ms-expand]:hidden
                    focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                    ${isPlaceholder ? "text-slate-400" : "text-slate-900"}`}
                >
                  <option value="" disabled hidden>
                    Select suffix
                  </option>
                  {SUFFIXES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              </div>
              <p
                className={`mt-1 h-5 text-sm ${
                  errors.suffix ? "text-red-600" : "invisible"
                }`}
              >
                {errors.suffix?.message || "placeholder"}
              </p>
            </div>

            {/* Former legal name materials */}
            <div className="w-full flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Do you ave any material under a former legal name
              </label>
              <div className="relative">
                <select
                  {...register("formerMaterial")}
                  className="peer h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-semibold shadow-sm
                    focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                    [&::-ms-expand]:hidden"
                >
                  <option>Yes</option>
                  <option>No</option>
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 peer-focus:text-indigo-500"
                />
              </div>
              <p className="mt-1 h-5 text-sm invisible">placeholder</p>
            </div>

            {/* DOB */}
            <div className="w-full flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Date of Birth <Req />
              </label>
              <div className="relative">
                <Calendar className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="date"
                  {...register("dateOfBirth", {
                    required: "Date of birth is required",
                  })}
                  className={`h-12 w-full rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                    ${
                      errors.dateOfBirth
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                />
              </div>
              <p
                className={`mt-1 h-5 text-sm ${
                  errors.dateOfBirth ? "text-red-600" : "invisible"
                }`}
              >
                {errors.dateOfBirth?.message || "placeholder"}
              </p>
            </div>
          </div>

          {/* Bottom action bar */}
          <div className="border-slate-200 bg-white/95 p-4 backdrop-blur">
            <div className="mx-auto w-full max-w-xl">
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
        </form>
      </main>
    </div>
  );
};

export default PersonalStepForm;
