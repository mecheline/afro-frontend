// ProfileWizard.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  UserRound,
  MapPinHouse,
  Contact,
  Users,
  Languages,
  Map,
  House,
  PersonStanding,
  GraduationCap,
  Wallet,
  Building,
  Cog,
  BookMarked,
  School,
  Activity,
  Info,
  ScrollText,
  ShieldCheck,
  ArrowLeft,
  MapPin,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import StepRenderer from "./StepRenderer";
import { Profile } from "../../../../redux/slices/scholar/authSlice";
import { toast } from "sonner";
import { RotatingLines } from "react-loader-spinner";

/* -------------------------------- Steps ---------------------------------- */
export type StepKey =
  | "personal"
  | "address"
  | "contact"
  | "demographics"
  | "language"
  | "geo"
  | "household"
  | "parent"
  | "siblings"
  | "education"
  | "financial"
  | "cbo"
  | "leadership"
  | "future"
  | "activity"
  | "additional"
  | "ssce"
  | "result";

type SidebarItem = { key: StepKey; name: string; icon: React.ReactNode };

const steps: SidebarItem[] = [
  { key: "personal", name: "Personal Info", icon: <UserRound /> },
  { key: "address", name: "Address", icon: <MapPinHouse /> },
  { key: "contact", name: "Contact Details", icon: <Contact /> },
  { key: "demographics", name: "Demographics", icon: <Users /> },
  { key: "language", name: "Language", icon: <Languages /> },
  { key: "geo", name: "Geography and nationality", icon: <Map /> },
  { key: "household", name: "Household", icon: <House /> },
  { key: "parent", name: "Parent", icon: <House /> },
  { key: "siblings", name: "Siblings", icon: <PersonStanding /> },
  { key: "education", name: "Education", icon: <GraduationCap /> },
  { key: "financial", name: "Financial Analysis", icon: <Wallet /> },
  { key: "cbo", name: "Community Based Org.", icon: <Building /> },
  { key: "leadership", name: "Leadership Track Record", icon: <Cog /> },
  { key: "future", name: "Future Plans", icon: <BookMarked /> },
  { key: "activity", name: "Activity", icon: <Activity /> },
  { key: "additional", name: "Additional Info", icon: <Info /> },
  { key: "ssce", name: "SSCE Examinations", icon: <ShieldCheck /> },
  { key: "result", name: "Result", icon: <ScrollText /> },
];

const baseUrl = import.meta.env.VITE_API_BASE_URL;

/* ----------------------------- API helpers ------------------------------- */
async function fetchStep(step: StepKey, token?: string) {
  const res = await fetch(`${baseUrl}/scholars/api/profile/${step}`, {
    headers: { Authorization: token ? `Bearer ${token}` : "" },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // { data: {...} } recommended
}

async function saveStep(step: StepKey, data: any, token?: string) {
  const res = await fetch(`${baseUrl}/scholars/api/profile/${step}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/* ------------------------------ Main Wizard ------------------------------ */
const ProfileWizard: React.FC = () => {
  const token = useSelector((s: any) => s.auth?.token);
  const dispatch = useDispatch();
  const [active, setActive] = useState<StepKey>("personal");
  const [cache, setCache] = useState<Record<StepKey, any>>({} as any);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const idx = useMemo(() => steps.findIndex((s) => s.key === active), [active]);
  const prevKey = idx > 0 ? steps[idx - 1].key : null;
  const nextKey = idx < steps.length - 1 ? steps[idx + 1].key : null;

  console.log(cache[active]);

  // Fetch when entering a step (if not cached)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (cache[active]) return;
      setLoading(true);
      try {
        const payload = await fetchStep(active, token);
        console.log(payload);
        if (mounted) {
          setCache((c) => ({ ...c, [active]: payload?.data ?? payload }));
        }
      } catch (e) {
        console.error(e);
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [active, token]); // eslint-disable-line

  const goPrev = (currentValues?: any) => {
    // keep local edits when navigating without saving
    if (currentValues) setCache((c) => ({ ...c, [active]: currentValues }));
    if (prevKey) setActive(prevKey);
  };

  const goNext = (currentValues?: any) => {
    // keep local edits when navigating without saving
    if (currentValues) setCache((c) => ({ ...c, [active]: currentValues }));
    if (nextKey) setActive(nextKey);
  };

  const handleSave = async (data: any) => {
    console.log(data);
    setSaving(true);
    try {
      const res = await saveStep(active, data, token);
      setCache((c) => ({ ...c, [active]: data }));
      // you can toast success here
      toast.success(res?.msg || "Saved");
      console.log(res);
      if (res?.step === "personal") {
        const payload = {
          firstName: res?.data?.firstName,
          lastName: res?.data?.lastName,
          avatar: res?.data?.avatarUrl,
        };
        dispatch(Profile(payload));
      }
    } catch (e) {
      console.error(e);

      // toast error
      toast.error("Try again later");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen min-h-0 flex">
      {/* Sidebar with its own scroll */}
      <aside className="hidden md:flex w-[280px] shrink-0 h-full overflow-y-auto bg-[#3062C8]">
        <nav className="p-4 space-y-1">
          {steps.map((s) => {
            const isActive = s.key === active;
            return (
              <button
                key={s.key}
                onClick={() => setActive(s.key)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-white
                ${
                  isActive
                    ? "bg-white/15 ring-1 ring-white/20"
                    : "hover:bg-white/10"
                }`}
              >
                <span className="text-[#EBC31E]">{s.icon}</span>
                <span className="text-left">{s.name}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main content with its own scroll */}
      <section className="flex-1 h-full overflow-y-auto bg-white">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <RotatingLines
              visible={true}
              width="58"
              strokeColor="#2F56D9"
              strokeWidth="5"
              animationDuration="0.75"
              ariaLabel="rotating-lines-loading"
            />
          </div>
        ) : (
          <StepRenderer
            step={active}
            initialData={cache[active]}
            onPrev={goPrev}
            onNext={goNext} // ← does NOT save
            onSave={handleSave} // ← persists current step
            isSaving={saving}
          />
        )}
      </section>
    </div>
  );
};

export default ProfileWizard;
