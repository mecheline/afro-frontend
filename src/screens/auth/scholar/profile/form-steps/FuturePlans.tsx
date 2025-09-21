// FuturePlansRHF.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { Req } from "../../../../../constants/Required";

type FormValues = {
  describeYou:
    | ""
    | "High school student"
    | "Undergraduate"
    | "Graduate"
    | "Working professional"
    | "Entrepreneur"
    | "Other";
  highestDegree:
    | ""
    | "Certificate"
    | "Diploma"
    | "Bachelor’s"
    | "Graduate"
    | "Master’s"
    | "Doctoral"
    | "Professional";
  careerInterest: string; // ← widened so any career label is allowed
};

// ── Categorized career options (expand/shrink as you like) ──
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
  Other: ["Other"],
};

const DESCRIBE_OPTIONS: Exclude<FormValues["describeYou"], "">[] = [
  "High school student",
  "Undergraduate",
  "Graduate",
  "Working professional",
  "Entrepreneur",
  "Other",
];

const DEGREE_INTENT: Exclude<FormValues["highestDegree"], "">[] = [
  "Certificate",
  "Diploma",
  "Bachelor’s",
  "Graduate",
  "Master’s",
  "Doctoral",
  "Professional",
];

const FuturePlansRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
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

  const submit = handleSubmit(async (v) => onSave?.(v));

  const isDescPlaceholder = watch("describeYou") === "";
  const isDegPlaceholder = watch("highestDegree") === "";
  const isCareerPlaceholder = watch("careerInterest") === "";

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
            Future Plans
          </span>
        </button>
      </div>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-4 pb-40 sm:px-6">
        {/* Which best describes you */}
        <div className="mt-6">
          <label className="mb-2 block text-base text-slate-700">
            Which best describes you <Req />
          </label>
          <div className="relative">
            <select
              {...register("describeYou", {
                required: "Please select an option",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.describeYou
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isDescPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select
              </option>
              {DESCRIBE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
            {errors.describeYou?.message}
          </div>
        </div>

        {/* Highest degree you intend to earn */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Highest degree you intend to earn <Req />
          </label>
          <div className="relative">
            <select
              {...register("highestDegree", {
                required: "Please select a degree",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.highestDegree
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isDegPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select degree
              </option>
              {DEGREE_INTENT.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
            {errors.highestDegree?.message}
          </div>
        </div>

        {/* Career interest (categorized dropdown) */}
        <div className="mt-4">
          <label className="mb-2 block text-base text-slate-700">
            Career interest <Req />
          </label>
          <div className="relative">
            <select
              {...register("careerInterest", {
                required: "Please select a career interest",
              })}
              className={`h-14 w-full appearance-none rounded-2xl border bg-slate-50 px-4 pr-10 text-base shadow-sm focus:bg-white focus:outline-none focus:ring-4
                ${
                  errors.careerInterest
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                }
                ${isCareerPlaceholder ? "text-slate-400" : "text-slate-900"}`}
            >
              <option value="" disabled hidden>
                Select career
              </option>
              {Object.entries(CAREER_CATEGORIES).map(([group, careers]) => (
                <optgroup key={group} label={group}>
                  {careers.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 text-sm text-red-600">
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
