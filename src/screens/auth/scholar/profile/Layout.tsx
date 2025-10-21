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
  Activity,
  Info,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router"; // <-- URL-driven
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

// helper: check if string is a valid StepKey from steps[]
const isStepKey = (v: string | undefined): v is StepKey =>
  !!v && steps.some((s) => s.key === v);

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
  const { step } = useParams<{ step?: string }>();
  const navigate = useNavigate();

  const token = useSelector((s: any) => s.auth?.token);
  const dispatch = useDispatch();

  // derive active from URL; guard invalid -> redirect to personal
  const active: StepKey = isStepKey(step) ? step : "personal";
  useEffect(() => {
    if (!isStepKey(step)) {
      navigate("/scholar/dashboard/profile/personal", { replace: true });
    }
  }, [step, navigate]);

  const [cache, setCache] = useState<Record<StepKey, any>>({} as any);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const idx = useMemo(() => steps.findIndex((s) => s.key === active), [active]);
  const prevKey = idx > 0 ? steps[idx - 1].key : null;
  const nextKey = idx < steps.length - 1 ? steps[idx + 1].key : null;

  // Fetch when entering a step (if not cached)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (cache[active]) return;
      setLoading(true);
      try {
        const payload = await fetchStep(active, token);
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
    if (currentValues) setCache((c) => ({ ...c, [active]: currentValues }));
    if (prevKey) navigate(`/scholar/dashboard/profile/${prevKey}`);
  };

  const goNext = (currentValues?: any) => {
    if (currentValues) setCache((c) => ({ ...c, [active]: currentValues }));
    if (nextKey) navigate(`/scholar/dashboard/profile/${nextKey}`);
  };

  const handleSave = async (data: any) => {
    setSaving(true);
    try {
      const res = await saveStep(active, data, token);
      setCache((c) => ({ ...c, [active]: data }));
      toast.success(res?.msg || "Saved");
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
      toast.error("Try again later");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto text-black">
      {/* stays inside Outlet width */}
      <section className="">
        {loading ? (
          <div className="flex items-center justify-center py-16 h-screen">
            <RotatingLines
              visible
              width="58"
              strokeColor="#ccc"
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
            onNext={goNext}
            onSave={handleSave}
            isSaving={saving}
          />
        )}
      </section>
    </div>
  );
};

export default ProfileWizard;
