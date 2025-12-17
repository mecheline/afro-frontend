// src/screens/onboarding/AccountSetupWizardRHF.tsx
import React, { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Mail,
  Phone,
  ChevronDown,
  Search,
  Pencil,
} from "lucide-react";
import { useAccountSetupMutation } from "../../../../redux/services/scholar/api";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../../redux/services/scholar/store";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { Profile } from "../../../../redux/slices/scholar/authSlice";

// ---- helpers/data (trim/extend as you like) ----
const EMPLOYMENT = ["Unemployed", "Part-time", "Full-time", "Others"] as const;
const DEGREES = [
  "Certificate",
  "Diploma",
  "Bachelors",
  "Masters",
  "Doctorate",
] as const;

const COUNTRIES = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Antigua & Deps",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia & Herzegovina",
  "Botswana",
  "Brazil",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo (DRC)",
  "Congo (Republic)",
  "Costa Rica",
  "Côte d’Ivoire",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Guatemala",
  "Guinea",
  "Guinea-Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Lucia",
  "Samoa",
  "San Marino",
  "São Tomé & Príncipe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Togo",
  "Tonga",
  "Trinidad & Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

// ---- schema ----
const schema = z.object({
  employmentStatus: z.enum(EMPLOYMENT, { message: "Choose one option" }),
  currentDegree: z.enum(DEGREES, { message: "Choose a degree" }),
  countryOfResidence: z.string().min(1, "Select your country"),
  // personal profile
  //avatar: z.any().optional(), // we’ll keep file optional
  avatar: z
    .custom<File>(
      (v) => v instanceof File && v.size > 0,
      "Profile picture is required"
    )
    .refine(
      (f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type),
      "Only JPG, PNG or WEBP"
    )
    .refine((f) => f.size <= 1 * 1024 * 1024, "Max size 1MB"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(6, "Enter a valid phone"),
  gender: z.enum(["Male", "Female", "Other"], {
    message: "Select gender",
  }),
});

type FormValues = z.infer<typeof schema>;

// ---- small atoms ----
const Container: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className = "",
  children,
}) => (
  <div className={`mx-auto w-full max-w-xl px-4 sm:px-6 ${className}`}>
    {children}
  </div>
);

const SectionTitle: React.FC<{ title: string; subtitle?: string }> = ({
  title,
  subtitle,
}) => (
  <div className="mb-4">
    <h1 className="text-center text-[28px] font-extrabold leading-tight text-slate-900 sm:text-4xl">
      {title}
    </h1>
    {subtitle && <p className="mt-2 text-center text-slate-500">{subtitle}</p>}
    <div className="mt-4 h-px w-full bg-slate-200" />
  </div>
);

// ---- main component ----
const AccountSetupWizardRHF: React.FC<{
  onSubmitAll?: (values: FormValues) => Promise<void> | void;
}> = () => {
  const dispatch = useDispatch();
  const email = useSelector((state: RootState) => state.auth.email);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      employmentStatus: undefined as any,
      currentDegree: undefined as any,
      countryOfResidence: "",
      avatar: undefined,
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: email ?? "",
      phone: "",
      gender: undefined as any,
    },
    mode: "onTouched",
  });

  // Queries and Mutations
  const [setup] = useAccountSetupMutation();

  // steps
  const steps = ["employment", "degree", "country", "profile"] as const;
  type Step = (typeof steps)[number];
  const [step, setStep] = useState<Step>("employment");

  // avatar preview
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  const handlePickAvatar = () => inputFileRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValue("avatar", file, { shouldDirty: true, shouldValidate: true }); // <-- validate now
    const url = URL.createObjectURL(file);
    setAvatarUrl(url);
  };

  // country search
  const [q, setQ] = useState("");
  const filteredCountries = useMemo(() => {
    if (!q) return COUNTRIES;
    const s = q.toLowerCase();
    return COUNTRIES.filter((c) => c.toLowerCase().includes(s));
  }, [q]);

  // step validation
  const validateStep = async (s: Step) => {
    if (s === "employment") {
      return trigger(["employmentStatus"]);
    }
    if (s === "degree") {
      return trigger(["currentDegree"]);
    }
    if (s === "country") {
      return trigger(["countryOfResidence"]);
    }
    if (s === "profile") {
      return trigger([
        "avatar",
        "firstName",
        "lastName",
        "dateOfBirth",
        "email",
        "phone",
        "gender",
      ]);
    }
    return true;
  };

  const goNext = async () => {
    const ok = await validateStep(step);
    if (!ok) return;
    const idx = steps.indexOf(step);
    if (idx < steps.length - 1) setStep(steps[idx + 1]);
  };
  const goBack = () => {
    const idx = steps.indexOf(step);
    if (idx > 0) setStep(steps[idx - 1]);
    else history.back();
  };

  const submitAll = async (values: FormValues) => {
    // await onSubmitAll?.(values);
    console.log("Account setup payload:", values);
    const form = new FormData();
    form.append("firstName", values.firstName);
    form.append("lastName", values.lastName);
    form.append("dateOfBirth", values.dateOfBirth); // YYYY-MM-DD
    form.append("phone", values.phone); // single string e.g. +234...
    form.append("gender", values.gender);
    form.append("employmentStatus", values.employmentStatus);
    form.append("currentDegree", values.currentDegree);
    form.append("countryOfResidence", values.countryOfResidence);
    form.append("email", values.email);
    // only append if it's a real File
    form.append("avatar", values.avatar); // field name must be 'avatar'
    try {
      const response = await setup(form).unwrap();
      console.log(response);
      const payload = {
        firstName: response?.firstName,
        lastName: response?.lastName,
        avatar: response?.avatar,
      };
      dispatch(Profile(payload));
      navigate("/scholar/dashboard", { replace: true });
      // demo
    } catch (error: any) {
      console.log(error);
      toast.error(error?.data?.msg);
    }
  };

  // reusable radio card
  const RadioCard: React.FC<{
    name: keyof FormValues;
    value: string;
    label: string;
    checked: boolean;
    onChange: () => void;
  }> = ({ name, value, label, checked, onChange }) => (
    <label
      className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-lg font-semibold transition ${
        checked
          ? "border-[#2F56D9] ring-2 ring-[#2F56D9]/40"
          : "border-slate-200"
      }`}
    >
      <input
        type="radio"
        className="h-5 w-5 rounded-full text-[#2F56D9] accent-[#2F56D9]"
        name={String(name)}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <span className="text-slate-900">{label}</span>
    </label>
  );

  // UI
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top bar */}
      <Container className="pt-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-xl font-bold text-slate-900">
            {step === "employment" && "What is your Employment Status"}
            {step === "degree" && "What is your current Degree"}
            {step === "country" && "Country of Residence"}
            {step === "profile" && "Fill Your Profile"}
          </span>
        </button>
      </Container>

      {/* Content */}
      <main className="pb-28 sm:pb-32">
        <Container className="mt-6">
          {step === "employment" && (
            <>
              <SectionTitle
                title="What is your Employment Status"
                subtitle="Are you currently in any employment"
              />
              <div className="space-y-3">
                {EMPLOYMENT.map((opt) => (
                  <RadioCard
                    key={opt}
                    name="employmentStatus"
                    value={opt}
                    label={opt}
                    checked={watch("employmentStatus") === opt}
                    onChange={() => setValue("employmentStatus", opt)}
                  />
                ))}
                {errors.employmentStatus && (
                  <p className="text-sm text-red-600">
                    {errors.employmentStatus.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          {step === "degree" && (
            <>
              <SectionTitle
                title="What is your current Degree"
                subtitle="Please select your current academy degree"
              />
              <div className="space-y-3">
                {DEGREES.map((opt) => (
                  <RadioCard
                    key={opt}
                    name="currentDegree"
                    value={opt}
                    label={opt}
                    checked={watch("currentDegree") === opt}
                    onChange={() => setValue("currentDegree", opt)}
                  />
                ))}
                {errors.currentDegree && (
                  <p className="text-sm text-red-600">
                    {errors.currentDegree.message as string}
                  </p>
                )}
              </div>
            </>
          )}

          {step === "country" && (
            <>
              <SectionTitle title="Country of Residence" />
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-2">
                <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                  <Search className="h-5 w-5 text-slate-400" />
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search"
                    className="w-full bg-transparent py-2 text-base outline-none placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {filteredCountries.map((c) => (
                  <label
                    key={c}
                    className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 text-lg transition ${
                      watch("countryOfResidence") === c
                        ? "border-[#2F56D9] ring-2 ring-[#2F56D9]/40"
                        : "border-slate-200"
                    }`}
                  >
                    <input
                      type="radio"
                      className="h-5 w-5 rounded-full text-[#2F56D9] accent-[#2F56D9]"
                      value={c}
                      checked={watch("countryOfResidence") === c}
                      onChange={() => setValue("countryOfResidence", c)}
                    />
                    <span className="text-slate-900">{c}</span>
                  </label>
                ))}
              </div>
              {errors.countryOfResidence && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.countryOfResidence.message as string}
                </p>
              )}
            </>
          )}

          {step === "profile" && (
            <>
              {/* Avatar */}
              <div className="mb-6 flex justify-center">
                <div className="relative">
                  <div className="grid h-36 w-36 place-items-center overflow-hidden rounded-full bg-slate-100">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <svg
                        viewBox="0 0 24 24"
                        className="h-20 w-20 text-slate-300"
                        fill="currentColor"
                      >
                        <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5ZM2 20a10 10 0 0 1 20 0H2Z" />
                      </svg>
                    )}
                  </div>
                  <button
                    onClick={handlePickAvatar}
                    type="button"
                    className="absolute bottom-2 right-2 grid h-9 w-9 place-items-center rounded-xl bg-[#2F56D9] text-white shadow"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <input
                    ref={inputFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              </div>
              {errors.avatar && (
                <p className="mb-4 text-center text-sm text-red-600">
                  {errors.avatar.message as string}
                </p>
              )}

              {/* Fields */}
              <div className="space-y-4">
                {/* First Name */}
                <div className="relative">
                  <input
                    placeholder="First Name"
                    {...register("firstName")}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.firstName
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="relative">
                  <input
                    placeholder="Last Name"
                    {...register("lastName")}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.lastName
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>

                {/* DOB */}
                <div className="relative">
                  <input
                    type="date"
                    placeholder="Date of Birth"
                    {...register("dateOfBirth")}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.dateOfBirth
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.dateOfBirth && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.dateOfBirth.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    placeholder="Email"
                    {...register("email")}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.email
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone (code + number) */}
                <div className="relative flex">
                  <div className="relative w-full">
                    <Phone className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      placeholder="+234 816 503 3526"
                      inputMode="tel"
                      {...register("phone")}
                      className={`h-14 w-full rounded-2xl border bg-slate-50/60 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                        errors.phone
                          ? "border-red-400 focus:ring-red-100"
                          : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                      }`}
                    />
                  </div>
                </div>
                {errors.phone && (
                  <p className="text-sm text-red-600">
                    {errors.phone?.message}
                  </p>
                )}

                {/* Gender */}
                <div className="relative">
                  <select
                    {...register("gender")}
                    className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50/60 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.gender
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                  >
                    <option value="" disabled>
                      Gender
                    </option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  {errors.gender && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.gender.message}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </Container>
      </main>

      {/* Bottom action bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 p-4 backdrop-blur mb-8">
        <Container>
          {step !== "profile" ? (
            <button
              type="button"
              onClick={goNext}
              className="h-14 w-full rounded-2xl bg-[#2F56D9] text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#274bc4] focus:outline-none focus:ring-4 focus:ring-indigo-200"
            >
              Continue
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(submitAll)}
              className="contents" /* keep layout */
            >
              <button
                type="submit"
                disabled={isSubmitting}
                className="h-14 w-full rounded-2xl bg-[#2F56D9] text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#274bc4] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AccountSetupWizardRHF;
