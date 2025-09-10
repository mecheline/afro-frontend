// GeographyNationalityRHF.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, ChevronDown, Loader2, Search } from "lucide-react";

/** ---------------- Types ---------------- */
type FormValues = {
  birthCountry: string;
  birthCity: string;
  yearsInCurrentCity: string;
  nationality: string;
};

const YEARS = Array.from({ length: 61 }, (_, i) => String(i)); // 0..60

/** ---------------- Small searchable select ----------------
 * Keyboard support kept simple; click-to-select is primary.
 * Integrates with RHF by writing chosen value via onChange.
 */
function useClickOutside(cb: () => void) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!ref.current) return;
      if (e.target instanceof Node && !ref.current.contains(e.target)) cb();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cb]);
  return ref;
}

type SearchSelectProps = {
  label: string;
  placeholder?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
};

const SearchSelect: React.FC<SearchSelectProps> = ({
  label,
  placeholder = "Search…",
  options,
  value,
  onChange,
  disabled,
  loading,
  error,
}) => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const wrapRef = useClickOutside(() => setOpen(false));

  useEffect(() => {
    // Close list when disabled
    if (disabled) setOpen(false);
  }, [disabled]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return options;
    return options.filter((o) => o.toLowerCase().includes(s));
  }, [q, options]);

  const placeholderMode = !value;

  return (
    <section className="mt-4">
      <label className="mb-3 block text-xl font-semibold text-slate-700">
        {label}
      </label>

      <div ref={wrapRef} className="relative">
        {/* "Input" that shows selected value and toggles list */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((s) => !s)}
          className={`
            h-12 w-full rounded-xl border bg-white px-4 pr-10 text-left text-base font-semibold shadow-sm
            focus:outline-none focus:ring-4 focus:ring-indigo-100
            ${disabled ? "opacity-60 cursor-not-allowed" : "hover:bg-slate-50"}
            ${error ? "border-red-400" : "border-slate-200"}
            ${placeholderMode ? "text-slate-400" : "text-slate-900"}
          `}
        >
          {value || `Choose ${label.toLowerCase()}`}
        </button>

        {/* Right adornment */}
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-slate-400" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
        )}

        {/* Dropdown */}
        {open && !disabled && (
          <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-200 px-3 py-2">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-transparent py-1 text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <ul className="max-h-64 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-2 text-sm text-slate-400">No results</li>
              )}
              {filtered.map((opt) => (
                <li key={opt}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setOpen(false);
                    }}
                    className={`
                      block w-full px-4 py-2 text-left text-sm
                      hover:bg-indigo-50 ${opt === value ? "bg-indigo-50" : ""}
                    `}
                  >
                    {opt}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-h-5 mt-1 text-sm text-red-600">{error}</div>
    </section>
  );
};

/** ---------------- Main component ---------------- */
const GeographyNationalityRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      birthCountry: "",
      birthCity: "",
      yearsInCurrentCity: "",
      nationality: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  // watch values
  const birthCountry = watch("birthCountry");

  // ------- Fetch countries + nationalities -------
  const [countries, setCountries] = useState<string[]>([]);
  const [nationalities, setNationalities] = useState<string[]>([]);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [countryErr, setCountryErr] = useState("");

  useEffect(() => {
    let ignore = false;
    const ctrl = new AbortController();

    async function load() {
      try {
        setLoadingCountries(true);
        setCountryErr("");
        const res = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,demonyms",
          { signal: ctrl.signal }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as Array<{
          name?: { common?: string };
          demonyms?: { eng?: { m?: string; f?: string } };
        }>;
        if (ignore) return;

        const names = data
          .map((c) => c?.name?.common)
          .filter(Boolean) as string[];
        const dem = new Set<string>();
        data.forEach((c) => {
          const m = c?.demonyms?.eng?.m;
          const f = c?.demonyms?.eng?.f;
          if (m) dem.add(m);
          if (f) dem.add(f);
        });

        setCountries(names.sort((a, b) => a.localeCompare(b)));
        setNationalities(Array.from(dem).sort((a, b) => a.localeCompare(b)));
      } catch (e: any) {
        if (!ignore) setCountryErr(e?.message || "Failed to load countries");
      } finally {
        if (!ignore) setLoadingCountries(false);
      }
    }
    load();
    return () => {
      ignore = true;
      ctrl.abort();
    };
  }, []);

  // ------- Fetch cities for selected country -------
  const [cities, setCities] = useState<string[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [cityErr, setCityErr] = useState("");

  useEffect(() => {
    if (!birthCountry) {
      setCities([]);
      return;
    }
    let ignore = false;
    const ctrl = new AbortController();
    async function loadCities() {
      try {
        setLoadingCities(true);
        setCityErr("");
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: birthCountry }),
            signal: ctrl.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { error: boolean; data?: string[]; msg?: string } =
          await res.json();
        if (ignore) return;

        if (json.error) throw new Error(json.msg || "Failed to load cities");

        setCities(
          (json.data || []).length ? (json.data as string[]) : ["Other"]
        );
        // clear city if not in list
        const cur = getValues("birthCity");
        if (cur && !(json.data || []).includes(cur)) setValue("birthCity", "");
      } catch (e: any) {
        if (!ignore) {
          setCityErr(e?.message || "Failed to load cities");
          setCities(["Other"]);
        }
      } finally {
        if (!ignore) setLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      ignore = true;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthCountry]);

  // Auto-pick a nationality heuristic
  useEffect(() => {
    if (!birthCountry || getValues("nationality")) return;
    const n = nationalities.find((x) =>
      x.toLowerCase().startsWith(birthCountry.toLowerCase().slice(0, 4))
    );
    if (n) setValue("nationality", n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthCountry, nationalities]);

  // Register hidden fields for validations (SearchSelect writes values via setValue)
  useEffect(() => {
    register("birthCountry", { required: "Select your birth country" });
    register("birthCity", { required: "Select your birth city" });
    register("nationality", { required: "Select your nationality" });
    register("yearsInCurrentCity", { required: "Select years lived" });
  }, [register]);

  // ----- Actions -----
  const save = handleSubmit(async (v) => onSave?.(v));

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="inline-flex items-center gap-2 rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 text-slate-800" />
          <span className="text-3xl font-extrabold text-slate-900">
            Geography and nationality
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-xl px-5 sm:px-6 pb-40">
        <SearchSelect
          label="Birth country"
          options={countries}
          value={watch("birthCountry")}
          onChange={(v) =>
            setValue("birthCountry", v, { shouldValidate: true })
          }
          disabled={loadingCountries}
          loading={loadingCountries}
          error={errors.birthCountry?.message || countryErr}
        />

        <SearchSelect
          label="City of birth"
          options={cities}
          value={watch("birthCity")}
          onChange={(v) => setValue("birthCity", v, { shouldValidate: true })}
          disabled={!watch("birthCountry") || loadingCities}
          loading={loadingCities}
          error={errors.birthCity?.message || cityErr}
        />

        {/* Years lived (simple non-search select) */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            No of years you have lived in current city
          </label>
          <div className="relative">
            <select
              {...register("yearsInCurrentCity", {
                required: "Select years lived",
              })}
              className={`h-12 w-full appearance-none rounded-xl border bg-white px-4 pr-10 text-base font-semibold shadow-sm
                focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100
                ${
                  errors.yearsInCurrentCity
                    ? "border-red-400"
                    : "border-slate-200"
                }
                ${
                  !watch("yearsInCurrentCity")
                    ? "text-slate-400"
                    : "text-slate-900"
                }`}
            >
              <option value="" disabled hidden>
                Select years
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.yearsInCurrentCity?.message}
          </div>
        </section>

        <SearchSelect
          label="Nationality"
          options={nationalities}
          value={watch("nationality")}
          onChange={(v) => setValue("nationality", v, { shouldValidate: true })}
          disabled={loadingCountries}
          loading={false}
          error={errors.nationality?.message}
        />
        <div className="mx-auto w-full max-w-xl">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={save}
              disabled={isSaving}
              className="h-12 rounded-2xl border-2 border-[#2F56D9] text-base font-semibold text-[#2F56D9] shadow-sm hover:bg-indigo-50 disabled:opacity-70"
            >
              {isSaving ? "Saving…" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => onNext?.(getValues())}
              className="h-12 rounded-2xl bg-slate-100 text-base font-semibold text-[#2F56D9] shadow hover:bg-slate-200 focus:outline-none"
            >
              Next
            </button>
          </div>
        </div>
      </main>

      {/* Bottom bar */}
    </div>
  );
};

export default GeographyNationalityRHF;
