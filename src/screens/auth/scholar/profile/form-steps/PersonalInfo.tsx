// PersonalInfoRHF.tsx
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, Pencil } from "lucide-react";

type FormValues = {
  firstName: string;
  preferredName?: string;
  middleName?: string;
  lastName: string;
  suffix: "Miss" | "Ms" | "Mrs" | "Mr" | "Dr" | "Prof";
  formerMaterial: "Yes" | "No";
  dateOfBirth: string; // YYYY-MM-DD
  avatar?: File;
};

const SUFFIXES: FormValues["suffix"][] = [
  "Miss",
  "Ms",
  "Mrs",
  "Mr",
  "Dr",
  "Prof",
];

const PersonalInfoRHF: React.FC<{
  onSubmit?: (values: FormValues) => Promise<void> | void;
}> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      firstName: "",
      preferredName: "",
      middleName: "",
      lastName: "",
      suffix: "Miss",
      formerMaterial: "Yes",
      dateOfBirth: "",
    },
    mode: "onTouched",
  });

  // avatar picker
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const pickAvatar = () => fileRef.current?.click();
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setValue("avatar", f, { shouldDirty: true });
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (v: FormValues) => {
    await onSubmit?.(v);
    // demo
    alert(JSON.stringify(v, null, 2));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="mx-auto w-full pt-4 sm:pt-6">
        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-3 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-2xl font-extrabold text-slate-900">
            Personal Info
          </span>
        </button>
      </div>

      {/* Page content */}
      <main className="mx-auto w-full sm:px-6 pb-16">
        {/* Avatar */}
        <div className="mt-2 mb-2 flex justify-center">
          <div className="relative">
            <div className="grid h-30 w-30 place-items-center overflow-hidden rounded-full bg-slate-100">
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                /* Placeholder “logo” circle look */
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
            <button
              type="button"
              onClick={pickAvatar}
              className="absolute bottom-2 right-2 grid h-10 w-10 place-items-center rounded-xl bg-[#2F56D9] text-white shadow-md"
              aria-label="Change picture"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form */}
        <form
          id="personalInfoForm"
          onSubmit={handleSubmit(submit)}
          className="space-y-5"
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            {/* Legal First Name */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Legal First Name
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
              {errors.firstName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Preferred Name (Optional) */}
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
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
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
            </div>

            {/* Family Surname */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Family Surname
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
              {errors.lastName && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            {/* Suffix */}
            <div className="">
              <label className="mb-2 block text-base text-slate-700">
                Suffix
              </label>
              <select
                {...register("suffix")}
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                {SUFFIXES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* Former legal name materials */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Do you ave any material under a former legal name
              </label>
              <select
                {...register("formerMaterial")}
                className="h-12 w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold shadow-sm focus:bg-white focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            {/* DOB */}
            <div className="flex-1">
              <label className="mb-2 block text-base text-slate-700">
                Date of Birth
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
              {errors.dateOfBirth && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.dateOfBirth.message}
                </p>
              )}
            </div>
          </div>
          {/* Bottom fixed action bar */}
          <div className=" border-slate-200 bg-white/95 p-4 backdrop-blur">
            <div className="mx-auto w-full max-w-xl">
              <button
                type="submit"
                form="personalInfoForm"
                disabled={isSubmitting}
                className="h-14 w-full rounded-2xl bg-[#2F56D9] text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#274bc4] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
};

export default PersonalInfoRHF;
