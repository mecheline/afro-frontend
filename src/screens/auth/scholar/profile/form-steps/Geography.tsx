// GeographyNationalityRHF.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Select from "react-select";
import { ArrowLeft } from "lucide-react";
import { Req } from "../../../../../constants/Required";

/** ---------------- Types ---------------- */
type FormValues = {
  birthCountry: string;
  birthState: string;
  birthLGA: string;
  birthCity: string;
  yearsInCurrentCity: string;
  nationality: string;
};

const YEARS = Array.from({ length: 61 }, (_, i) => String(i)); // 0..60

/** ---------------- react-select utils ---------------- */
type Opt = { value: string; label: string };
const toOpts = (arr: string[]): Opt[] =>
  arr.map((v) => ({ value: v, label: v }));
const findOpt = (opts: Opt[], v?: string) =>
  opts.find((o) => o.value === (v ?? "")) ?? null;
const ensureHasValue = (opts: Opt[], v?: string) =>
  v && !opts.some((o) => o.value === v)
    ? [...opts, { value: v, label: v }]
    : opts;

const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    minHeight: 56,
    borderRadius: 8,
    borderColor: state.isFocused ? "#6366f1" : "#e2e8f0",
    boxShadow: state.isFocused ? "0 0 0 0px rgba(99,102,241,0.15)" : "none",
    backgroundColor: "#fff",
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

/** ---------------- Main component ---------------- */
const GeographyNationalityRHF: React.FC<{
  initialData?: Partial<FormValues>;
  onPrev?: (values: FormValues) => void;
  onNext?: (values: FormValues) => void;
  onSave?: (values: FormValues) => Promise<void> | void;
  isSaving?: boolean;
}> = ({ initialData, onPrev, onNext, onSave, isSaving }) => {
  const {
    control,
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      birthCountry: "",
      birthState: "",
      birthLGA: "",
      birthCity: "",
      yearsInCurrentCity: "",
      nationality: "",
      ...initialData,
    },
    mode: "onTouched",
  });

  // watch values
  const birthCountry = watch("birthCountry");
  const birthState = watch("birthState");

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

  // ------- Fetch states for selected country -------
  const [states, setStates] = useState<string[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [stateErr, setStateErr] = useState("");

  useEffect(() => {
    // reset dependent fields when country changes
    setValue("birthState", "", { shouldValidate: true });
    setValue("birthLGA", "", { shouldValidate: true });

    if (!birthCountry) {
      setStates([]);
      return;
    }

    let ignore = false;
    const ctrl = new AbortController();

    async function loadStates() {
      try {
        setLoadingStates(true);
        setStateErr("");
        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/states",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: birthCountry }),
            signal: ctrl.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: {
          error: boolean;
          msg?: string;
          data?: { name: string; states?: Array<{ name: string }> };
        } = await res.json();
        if (ignore) return;

        if (json.error) throw new Error(json.msg || "Failed to load states");

        const names =
          json?.data?.states?.map((s) => s.name).filter(Boolean) ?? [];
        setStates(
          names.length ? names.sort((a, b) => a.localeCompare(b)) : ["Other"]
        );
      } catch (e: any) {
        if (!ignore) {
          setStateErr(e?.message || "Failed to load states");
          setStates(["Other"]);
        }
      } finally {
        if (!ignore) setLoadingStates(false);
      }
    }
    loadStates();

    return () => {
      ignore = true;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthCountry]);

  // ------- Fetch LGAs for selected state -------
  const [lgas, setLgas] = useState<string[]>([]);
  const [loadingLgas, setLoadingLgas] = useState(false);
  const [lgaErr, setLgaErr] = useState("");

  useEffect(() => {
    // reset when state changes
    setValue("birthLGA", "", { shouldValidate: true });

    if (!birthCountry || !birthState) {
      setLgas([]);
      return;
    }

    let ignore = false;
    const ctrl = new AbortController();

    async function loadLGAs() {
      try {
        setLoadingLgas(true);
        setLgaErr("");

        const res = await fetch(
          "https://countriesnow.space/api/v0.1/countries/state/cities",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ country: birthCountry, state: birthState }),
            signal: ctrl.signal,
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: { error: boolean; data?: string[]; msg?: string } =
          await res.json();
        if (ignore) return;

        if (json.error) throw new Error(json.msg || "Failed to load LGAs");

        const names = (json.data || []).filter(Boolean);
        setLgas(
          names.length ? names.sort((a, b) => a.localeCompare(b)) : ["Other"]
        );
      } catch (e: any) {
        if (!ignore) {
          setLgaErr(e?.message || "Failed to load LGAs");
          setLgas(["Other"]);
        }
      } finally {
        if (!ignore) setLoadingLgas(false);
      }
    }
    loadLGAs();

    return () => {
      ignore = true;
      ctrl.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [birthCountry, birthState]);

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

  // Register hidden fields for validations (for the month input below)
  useEffect(() => {
    register("yearsInCurrentCity", { required: "Select years lived" });
  }, [register]);

  // ----- Actions -----
  const save = handleSubmit(async (v) => onSave?.(v));

  // ----- Build options (and seed current values so react-select can show them) -----
  const countryOpts = useMemo(
    () => ensureHasValue(toOpts(countries), watch("birthCountry")),
    [countries, watch("birthCountry")]
  );
  const stateOpts = useMemo(
    () => ensureHasValue(toOpts(states), watch("birthState")),
    [states, watch("birthState")]
  );
  const lgaOpts = useMemo(
    () => ensureHasValue(toOpts(lgas), watch("birthLGA")),
    [lgas, watch("birthLGA")]
  );
  const cityOpts = useMemo(
    () => ensureHasValue(toOpts(cities), watch("birthCity")),
    [cities, watch("birthCity")]
  );
  const nationalityOpts = useMemo(
    () => ensureHasValue(toOpts(nationalities), watch("nationality")),
    [nationalities, watch("nationality")]
  );
  const yearOpts = useMemo(
    () => ensureHasValue(toOpts(YEARS), watch("yearsInCurrentCity")),
    [watch("yearsInCurrentCity")]
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="px-5 pt-5 sm:px-6">
        <button
          type="button"
          onClick={() => onPrev?.(getValues())}
          className="headerTitle"
          aria-label="Go back"
        >
          <ArrowLeft className="h-6 w-6 " />
          <span className="text-3xl font-extrabold ">
            Geography and nationality
          </span>
        </button>
      </header>

      {/* Content */}
      <main className="mx-auto w-full max-w-2xl px-5 sm:px-6 pb-40">
        {/* Birth country */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            Birth country <Req />
          </label>
          <Controller
            control={control}
            name="birthCountry"
            rules={{ required: "Select your birth country" }}
            render={({ field }) => (
              <Select
                instanceId="birthCountry"
                styles={selectStyles}
                isSearchable
                isClearable
                isLoading={loadingCountries}
                options={countryOpts}
                value={findOpt(countryOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder="Choose birth country"
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.birthCountry?.message || countryErr}
          </div>
        </section>

        {/* State / Province */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            State / Province <Req />
          </label>
          <Controller
            control={control}
            name="birthState"
            rules={{ required: "Select your state/province" }}
            render={({ field }) => (
              <Select
                instanceId="birthState"
                styles={selectStyles}
                isSearchable
                isClearable
                isDisabled={!birthCountry}
                isLoading={loadingStates}
                options={stateOpts}
                value={findOpt(stateOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder={
                  birthCountry
                    ? "Choose state/province"
                    : "Select country first"
                }
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.birthState?.message || stateErr}
          </div>
        </section>

        {/* LGA / District */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            LGA / District <Req />
          </label>
          <Controller
            control={control}
            name="birthLGA"
            rules={{ required: "Select your LGA / district" }}
            render={({ field }) => (
              <Select
                instanceId="birthLGA"
                styles={selectStyles}
                isSearchable
                isClearable
                isDisabled={!birthState}
                isLoading={loadingLgas}
                options={lgaOpts}
                value={findOpt(lgaOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder={
                  birthState ? "Choose LGA / district" : "Select state first"
                }
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.birthLGA?.message || lgaErr}
          </div>
        </section>

        {/* City of birth */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            City of birth <Req />
          </label>
          <Controller
            control={control}
            name="birthCity"
            rules={{ required: "Select your birth city" }}
            render={({ field }) => (
              <Select
                instanceId="birthCity"
                styles={selectStyles}
                isSearchable
                isClearable
                isDisabled={!birthCountry}
                isLoading={loadingCities}
                options={cityOpts}
                value={findOpt(cityOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder={
                  birthCountry ? "Choose city" : "Select country first"
                }
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.birthCity?.message || cityErr}
          </div>
        </section>

        {/* Years lived in current city */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            No of years you have lived in current city <Req />
          </label>
          <Controller
            control={control}
            name="yearsInCurrentCity"
            rules={{ required: "Select years lived" }}
            render={({ field }) => (
              <Select
                instanceId="yearsInCurrentCity"
                styles={selectStyles}
                isSearchable
                isClearable
                options={yearOpts}
                value={findOpt(yearOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder="Select years"
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.yearsInCurrentCity?.message}
          </div>
        </section>

        {/* Nationality */}
        <section className="mt-4">
          <label className="mb-3 block text-xl font-semibold text-slate-700">
            Nationality <Req />
          </label>
          <Controller
            control={control}
            name="nationality"
            rules={{ required: "Select your nationality" }}
            render={({ field }) => (
              <Select
                instanceId="nationality"
                styles={selectStyles}
                isSearchable
                isClearable
                isLoading={loadingCountries}
                options={nationalityOpts}
                value={findOpt(nationalityOpts, field.value)}
                onChange={(opt) => field.onChange((opt?.value as string) ?? "")}
                placeholder="Choose nationality"
              />
            )}
          />
          <div className="min-h-5 mt-1 text-sm text-red-600">
            {errors.nationality?.message}
          </div>
        </section>

        <div className="mx-auto w-full max-w-xl mt-6">
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
    </div>
  );
};

export default GeographyNationalityRHF;
