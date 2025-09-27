// FuturePlansRHF.tsx
import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import CreatableSelect from "react-select/creatable";
import { ArrowLeft } from "lucide-react";
import { Req } from "../../../../../constants/Required";

/* ---------- Types ---------- */
type FormValues = {
  describeYou:
    | ""
    | "High school student"
    | "Undergraduate"
    | "Graduate"
    | "Working professional"
    | "Entrepreneur";
  highestDegree:
    | ""
    | "Certificate"
    | "Diploma"
    | "Bachelor’s"
    | "Graduate"
    | "Master’s"
    | "Doctoral"
    | "Professional";
  careerInterest: string; // free text allowed (creatable)
};

/* ---------- Data ---------- */
// Removed "Other" from categories entirely
const CAREER_CATEGORIES: Record<string, string[]> = {
  "Accounting & Finance": [
    "Chartered Accountant",
    "Accountant",
    "Auditor",
    "Tax Consultant",
    "Finance Analyst",
    "Investment Analyst",
    "Portfolio Manager",
    "Risk Analyst",
    "Financial Advisor",
    "Actuary",
    "Treasury Analyst",
    "Credit Analyst",
    "Loan Officer",
    "Internal Auditor",
    "Compliance Officer",
  ],
  "Software & IT": [
    "Software Engineer",
    "Frontend Developer",
    "Backend Developer",
    "Full-Stack Developer",
    "Mobile App Developer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Site Reliability Engineer",
    "QA Engineer / SDET",
    "Data Analyst",
    "Data Scientist",
    "Machine Learning Engineer",
    "AI Researcher",
    "Cybersecurity Analyst",
    "Network Engineer",
    "IT Support Specialist",
    "Database Administrator",
    "Product Manager (Tech)",
    "UI/UX Designer",
    "Game Developer",
    "Blockchain Developer",
  ],
  Healthcare: [
    "Doctor",
    "Nurse",
    "Pharmacist",
    "Dentist",
    "Medical Laboratory Scientist",
    "Physiotherapist",
    "Radiographer",
    "Optometrist",
    "Public Health Officer",
    "Health Information Manager",
    "Nutritionist / Dietitian",
    "Occupational Therapist",
    "Psychologist",
    "Psychiatrist",
    "Midwife",
    "Veterinary Doctor",
  ],
  "Law & Public Policy": [
    "Lawyer",
    "Solicitor",
    "Paralegal",
    "Legal Clerk",
    "Legal Consultant",
    "Mediator",
    "Policy Analyst",
    "Compliance & Regulatory Specialist",
    "Immigration Officer",
    "Customs Officer",
  ],
  Engineering: [
    "Civil Engineer",
    "Mechanical Engineer",
    "Electrical Engineer",
    "Electronics Engineer",
    "Mechatronics Engineer",
    "Chemical Engineer",
    "Petroleum Engineer",
    "Industrial Engineer",
    "Structural Engineer",
    "Biomedical Engineer",
    "Environmental Engineer",
    "Materials Engineer",
    "Automotive Engineer",
    "Aerospace Engineer",
    "Water Resources Engineer",
    "Marine / Naval Architect",
    "Mining Engineer",
    "Metallurgical Engineer",
  ],
  "Business & Management": [
    "Entrepreneur",
    "Business Analyst",
    "Operations Manager",
    "Project Manager",
    "Scrum Master",
    "Product Manager",
    "Management Consultant",
    "Business Development Manager",
    "Customer Success Manager",
    "Human Resources Manager",
    "Recruiter / Talent Acquisition",
    "Marketing Manager",
    "Brand Manager",
    "Sales Manager",
    "Procurement Specialist",
    "Supply Chain Analyst",
    "Logistics Manager",
  ],
  "Creative, Media & Communications": [
    "Journalist",
    "Reporter",
    "Editor",
    "Copywriter",
    "Content Strategist",
    "Social Media Manager",
    "Public Relations Officer",
    "Photographer",
    "Videographer",
    "Film Director",
    "Producer",
    "Graphic Designer",
    "Animator / Motion Designer",
    "Sound Engineer",
    "Music Producer",
    "Fashion Designer",
    "Interior Designer",
    "Event Planner",
  ],
  Education: [
    "Teacher (Primary)",
    "Teacher (Secondary)",
    "Lecturer",
    "Researcher",
    "Instructional Designer",
    "School Counselor",
    "Education Administrator",
  ],
  "Agriculture & Environment": [
    "Farmer",
    "Agronomist",
    "Animal Scientist",
    "Fisheries Officer",
    "Forestry Officer",
    "Environmental Scientist",
    "Conservation Officer",
    "GIS Analyst",
    "Hydrologist",
    "Meteorologist",
    "Soil Scientist",
  ],
  "Trades & Technical": [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mason",
    "Welder",
    "Auto Mechanic",
    "Auto Electrician",
    "HVAC Technician",
    "Solar PV Installer",
    "CNC Machinist",
    "Drone Pilot",
  ],
  "Logistics, Transport & Aviation": [
    "Professional Driver",
    "Fleet Manager",
    "Logistics Coordinator",
    "Supply Chain Planner",
    "Warehouse Manager",
    "Freight Forwarder",
    "Pilot",
    "Flight Attendant",
    "Air Traffic Controller",
    "Aviation Safety Officer",
  ],
  "Hospitality & Tourism": [
    "Chef",
    "Baker",
    "Hotel Manager",
    "Housekeeping Supervisor",
    "Tour Guide",
    "Travel Agent",
    "Concierge",
    "Bartender",
    "Barista",
    "Event Coordinator",
  ],
  "Banking & Insurance": [
    "Banker",
    "Teller",
    "Relationship Manager",
    "Underwriter",
    "Claims Adjuster",
    "Insurance Broker",
    "Risk Manager",
    "Compliance Analyst",
  ],
  "Real Estate & Construction": [
    "Real Estate Agent",
    "Property Manager",
    "Quantity Surveyor",
    "Building Surveyor",
    "Estate Valuer",
    "Land Surveyor",
    "Urban Planner",
    "Construction Manager",
    "Site Engineer",
    "HSE Officer",
  ],
  "Energy & Utilities": [
    "Power Systems Engineer",
    "Renewable Energy Engineer",
    "Oil & Gas Engineer",
    "Drilling Engineer",
    "Reservoir Engineer",
    "Energy Analyst",
    "HSE Specialist",
  ],
  "Public Service & Security": [
    "Police Officer",
    "Military Officer",
    "Firefighter",
    "Intelligence Analyst",
    "Security Analyst",
    "FRSC Officer",
    "Immigration Officer",
    "Customs Officer",
  ],
  "Social Services & NGO": [
    "Social Worker",
    "NGO Program Officer",
    "Community Development Officer",
    "Grant Writer / Fundraiser",
    "Counselor",
  ],
  "Retail & E-commerce": [
    "Retail Manager",
    "Store Manager",
    "Visual Merchandiser",
    "E-commerce Manager",
    "Marketplace Specialist",
  ],
  "Sports & Fitness": [
    "Professional Athlete",
    "Coach",
    "Fitness Trainer",
    "Sports Therapist",
    "Sports Analyst",
  ],
  "Beauty & Wellness": [
    "Hair Stylist",
    "Barber",
    "Makeup Artist",
    "Esthetician",
    "Spa Therapist",
  ],
  "Science & Research": [
    "Biochemist",
    "Microbiologist",
    "Chemist",
    "Physicist",
    "Pharmacologist",
    "Research Scientist",
    "Laboratory Technician",
  ],
  Telecommunications: [
    "Telecom Engineer",
    "RF Engineer",
    "Field Engineer (Telecom)",
    "NOC Engineer",
  ],
  Maritime: [
    "Marine Engineer",
    "Ship Captain",
    "Deck Officer",
    "Port/Harbor Operations Officer",
    "Marine Surveyor",
  ],
};

const DESCRIBE_OPTIONS: NonNullable<FormValues["describeYou"]>[] = [
  "High school student",
  "Undergraduate",
  "Graduate",
  "Working professional",
  "Entrepreneur",
];

const DEGREE_INTENT: NonNullable<FormValues["highestDegree"]>[] = [
  "Certificate",
  "Diploma",
  "Bachelor’s",
  "Graduate",
  "Master’s",
  "Doctoral",
  "Professional",
];

/* ---------- react-select helpers ---------- */
type Opt<T extends string = string> = { value: T; label: string };
type Grouped = { label: string; options: Opt[] };

const toOpts = <T extends string>(arr: readonly T[]): Opt<T>[] =>
  arr.map((v) => ({ value: v, label: v }));

const buildCareerGroups = (): Grouped[] =>
  Object.entries(CAREER_CATEGORIES).map(([label, items]) => ({
    label,
    options: toOpts(items),
  }));

/* ---------- Styles ---------- */
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 56,
    borderRadius: 16,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 4px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "#f8fafc",
    ":hover": { borderColor: state.isFocused ? "#6366f1" : "#e2e8f0" },
  }),
  option: (base: any, state: any) => ({
    ...base,
    color: state.isDisabled ? "#9CA3AF" : "#111827",
    backgroundColor: state.isSelected
      ? "#E0E7FF"
      : state.isFocused
      ? "#EEF2FF"
      : "white",
  }),
  singleValue: (base: any) => ({ ...base, color: "#111827" }),
  input: (base: any) => ({ ...base, color: "#111827" }),
  placeholder: (base: any) => ({ ...base, color: "#6B7280" }),
  menu: (base: any) => ({ ...base, zIndex: 30 }),
  valueContainer: (base: any) => ({ ...base, padding: "0 12px" }),
};

const findOpt = (opts: Opt[], val?: string) =>
  opts.find((o) => o.value === (val ?? "")) ?? null;

const findInGroups = (groups: Grouped[], val?: string) => {
  if (!val) return null;
  for (const g of groups) {
    const f = g.options.find((o) => o.value === val);
    if (f) return f;
  }
  return null;
};

/* ---------- Component ---------- */
const FuturePlansRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    control,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      describeYou: "",
      highestDegree: "",
      careerInterest: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  // Local option state so newly created items persist for this session
 /*  const [describeOpts, setDescribeOpts] = useState<Opt[]>(
    toOpts(DESCRIBE_OPTIONS)
  );
  const [degreeOpts, setDegreeOpts] = useState<Opt[]>(toOpts(DEGREE_INTENT));
  const [careerGroups, setCareerGroups] = useState<Grouped[]>(
    buildCareerGroups()
  ); */

  // For "creatable with groups": stash custom careers into a "Custom" group
  const ensureCustomGroup = () => {
    const has = careerGroups.some((g) => g.label === "Custom");
    if (!has)
      setCareerGroups((prev) => [{ label: "Custom", options: [] }, ...prev]);
  };

  const submit = handleSubmit(async (v) => onSave?.(v));

  const isDescPlaceholder = watch("describeYou") === "";
  const isDegPlaceholder = watch("highestDegree") === "";
  const isCareerPlaceholder = watch("careerInterest") === "";

  // helpers
  const toOpt = (v: string) => ({ value: v, label: v });
  const inOpts = (opts: { value: string }[], v?: string) =>
    !!v && opts.some((o) => o.value === v);
  const inGroups = (groups: Grouped[], v?: string) =>
    !!v && groups.some((g) => g.options.some((o) => o.value === v));

  // ⬇️ use lazy init so it runs once with initialData
  const [describeOpts, setDescribeOpts] = useState<Opt[]>(() => {
    const base = toOpts(DESCRIBE_OPTIONS);
    const init = initialData?.describeYou ?? "";
    return init && !inOpts(base, init) ? [...base, toOpt(init)] : base;
  });

  const [degreeOpts, setDegreeOpts] = useState<Opt[]>(() => {
    const base = toOpts(DEGREE_INTENT);
    const init = initialData?.highestDegree ?? "";
    return init && !inOpts(base, init) ? [...base, toOpt(init)] : base;
  });

  const [careerGroups, setCareerGroups] = useState<Grouped[]>(() => {
    const base = buildCareerGroups();
    const init = initialData?.careerInterest ?? "";
    if (init && !inGroups(base, init)) {
      return [{ label: "Custom", options: [toOpt(init)] }, ...base];
    }
    return base;
  });

  React.useEffect(() => {
    const d = initialData?.describeYou ?? "";
    if (d && !inOpts(describeOpts, d)) setDescribeOpts((p) => [...p, toOpt(d)]);

    const h = initialData?.highestDegree ?? "";
    if (h && !inOpts(degreeOpts, h)) setDegreeOpts((p) => [...p, toOpt(h)]);

    const c = initialData?.careerInterest ?? "";
    if (c && !inGroups(careerGroups, c)) {
      setCareerGroups((p) => {
        const i = p.findIndex((g) => g.label === "Custom");
        if (i === -1) return [{ label: "Custom", options: [toOpt(c)] }, ...p];
        if (!p[i].options.some((o) => o.value === c)) {
          const next = [...p];
          next[i] = { ...next[i], options: [...next[i].options, toOpt(c)] };
          return next;
        }
        return p;
      });
    }
  }, [initialData]); // runs if the prop updates

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-2xl font-extrabold text-slate-900">
            Future Plans
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-4 pb-40 sm:px-6">
        {/* Which best describes you */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Which best describes you <Req />
          </label>
          <Controller
            control={control}
            name="describeYou"
            rules={{ required: "Please select an option" }}
            render={({ field }) => (
              <CreatableSelect
                instanceId="describeYou"
                styles={selectStyles}
                isSearchable
                isClearable
                options={describeOpts}
                value={findOpt(describeOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                onCreateOption={(input) => {
                  const opt = { value: input, label: input };
                  setDescribeOpts((prev) => [...prev, opt]);
                  field.onChange(input);
                }}
                placeholder="Select"
                className={
                  isDescPlaceholder ? "text-slate-400" : "text-slate-900"
                }
              />
            )}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.describeYou?.message}
          </div>
        </div>

        {/* Highest degree you intend to earn */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Highest degree you intend to earn <Req />
          </label>
          <Controller
            control={control}
            name="highestDegree"
            rules={{ required: "Please select a degree" }}
            render={({ field }) => (
              <CreatableSelect
                instanceId="highestDegree"
                styles={selectStyles}
                isSearchable
                isClearable
                options={degreeOpts}
                value={findOpt(degreeOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                onCreateOption={(input) => {
                  const opt = { value: input, label: input };
                  setDegreeOpts((prev) => [...prev, opt]);
                  field.onChange(input);
                }}
                placeholder="Select degree"
                className={
                  isDegPlaceholder ? "text-slate-400" : "text-slate-900"
                }
              />
            )}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.highestDegree?.message}
          </div>
        </div>

        {/* Career interest (grouped + creatable) */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Career interest <Req />
          </label>
          <Controller
            control={control}
            name="careerInterest"
            rules={{ required: "Please select a career interest" }}
            render={({ field }) => (
              <CreatableSelect
                instanceId="careerInterest"
                styles={selectStyles}
                isSearchable
                isClearable
                options={careerGroups}
                // react-select can accept grouped options; value is still a flat option
                value={findInGroups(careerGroups, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                onCreateOption={(input) => {
                  ensureCustomGroup();
                  setCareerGroups((prev) => {
                    const next = [...prev];
                    const idx = next.findIndex((g) => g.label === "Custom");
                    const exists =
                      idx >= 0 &&
                      next[idx].options.some((o) => o.value === input);
                    if (idx >= 0 && !exists) {
                      next[idx] = {
                        ...next[idx],
                        options: [
                          ...next[idx].options,
                          { value: input, label: input },
                        ],
                      };
                    }
                    return next;
                  });
                  field.onChange(input);
                }}
                placeholder="Select career"
                className={
                  isCareerPlaceholder ? "text-slate-400" : "text-slate-900"
                }
              />
            )}
          />
          <div className="min-h-5 pt-1 text-sm text-red-600">
            {errors.careerInterest?.message}
          </div>
        </div>

        <div className="mx-auto grid w-full max-w-xl grid-cols-2 gap-4">
          <button
            type="button"
            onClick={submit}
            disabled={isSaving}
            className="h-12 rounded-2xl border-2 border-[#2F56D9] text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
          >
            {isSaving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            onClick={() => onNext?.(getValues())}
            className="h-12 rounded-2xl bg-slate-100 text-[#2F56D9] shadow hover:bg-slate-200 focus:outline-none"
          >
            Next
          </button>
        </div>
      </main>
    </div>
  );
};

export default FuturePlansRHF;
