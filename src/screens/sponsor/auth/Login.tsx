// src/screens/auth/CreateAccountRHF.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, X, User } from "lucide-react";
import { Link, useNavigate } from "react-router";
import logo from "../../../assets/logo.png";
import {
  useForgotSponsorPasswordMutation,
  useLazyGetScholarshipStatsQuery,
  useSponsorsLoginMutation,
} from "../../../redux/services/scholar/api";
import { useDispatch } from "react-redux";
import { Login } from "../../../redux/slices/scholar/authSlice";
import { toast } from "sonner";

// ---------- Schemas ----------
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

// ---------- Types ----------
type LoginValues = z.infer<typeof loginSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

type Phase = "login" | "forgot";

const SponsorLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("login");
  const [showPassword, setShowPassword] = useState(false);

  const [sponsorOption, setSponsorOption] = useState(false);
  const [sponsorType, setSponsorType] = useState<"Individual" | "Corporate">(
    "Individual"
  );

  // Queries and mutations

  const [login] = useSponsorsLoginMutation();
  const [forgotPassword] = useForgotSponsorPasswordMutation();

  const [checkScholarshipCount] = useLazyGetScholarshipStatsQuery();

  // -------- Login form --------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  // -------- Forgot form --------
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors, isSubmitting: isSendingLink },
    watch: watchForgot,
  } = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
    mode: "onTouched",
  });

  // ---------- Handlers ----------
  const onLoginSubmit = async (values: LoginValues) => {
    // TODO: call your login API
    try {
      const response = await login(values).unwrap();
      console.log(response);
      toast.success("Logged in success");

      dispatch(Login(response));

      const res = await checkScholarshipCount().unwrap();
      console.log(res);
      if (res?.total > 0) {
        navigate("/sponsor/dashboard");
      } else {
        navigate("/sponsor/scholarships/create");
      }
    } catch (error: any) {
      console.log(error);
      toast.error(error?.data?.msg);
    }
  };

  const onForgotSubmit = async (values: ForgotValues) => {
    // TODO: call your "request reset" API, e.g. await requestPasswordReset(values)
    console.log("forgot payload:", values);
    // If API responds OK, show reset screen
    try {
      const response = await forgotPassword(values).unwrap();
      console.log(response);
      toast.success(response?.msg);
    } catch (error) {
      console.log(error);
    }
  };

  const handleSponsorStartup = () => {
    navigate("/auth/sponsor/signup", { state: { type: sponsorType } });
  };

  // ---------- UI ----------
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top bar */}
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:pt-6">
        <button
          aria-label="Go back"
          onClick={() => {
            if (phase === "forgot") setPhase("login");
            //else if (phase === "reset") setPhase("forgot");
            else window.history.back();
          }}
          className="inline-flex items-center justify-center rounded-full p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <ArrowLeft className="h-6 w-6 text-slate-700" />
        </button>
      </div>

      <main className="mx-auto grid max-w-3xl grid-cols-1 px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={"/"}>
          <img
            src={logo}
            alt="logo"
            className="flex items-center justify-center mx-auto cursor-pointer"
          />
        </Link>

        {/* ------ LOGIN PHASE ------ */}
        {phase === "login" && (
          <>
            <h1 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Login to Your Account
            </h1>

            <form
              onSubmit={handleSubmit(onLoginSubmit)}
              className="mx-auto mt-8 w-full max-w-xl space-y-4"
            >
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    {...register("email")}
                    aria-invalid={!!errors.email}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      errors.email
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    autoComplete="current-password"
                    {...register("password")}
                    aria-invalid={!!errors.password}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 pl-11 pr-11 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                      errors.password
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                    }`}
                  />
                  <button
                    type="button"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Forgot link */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setPhase("forgot")}
                  className="text-sm font-medium text-[#2F56D9] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-14 w-full rounded-2xl bg-[#2F56D9] px-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#2448bd] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isSubmitting ? "Please wait..." : "Login"}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-slate-200" />
                </div>
              </div>

              <p className="pt-6 text-center text-base text-slate-500">
                Don&apos;t have an account?{" "}
                <span
                  onClick={() => setSponsorOption(true)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSponsorOption(true);
                    }
                  }}
                  className="font-semibold text-[#2F56D9] hover:underline cursor-pointer"
                >
                  Sign up
                </span>
              </p>
            </form>
          </>
        )}

        {/* ------ FORGOT PHASE ------ */}
        {phase === "forgot" && (
          <>
            <h1 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Forgot password
            </h1>
            <p className="mt-2 text-center text-slate-500">
              Enter your email to receive a password reset link.
            </p>

            <form
              onSubmit={handleForgotSubmit(onForgotSubmit)}
              className="mx-auto mt-8 w-full max-w-xl space-y-4"
            >
              <div>
                <label htmlFor="fp-email" className="sr-only">
                  Email
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="fp-email"
                    type="email"
                    placeholder="Email"
                    autoComplete="email"
                    {...registerForgot("email")}
                    aria-invalid={!!forgotErrors.email}
                    className={`h-14 w-full rounded-2xl border bg-slate-50/60 pl-11 pr-4 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-100 ${
                      forgotErrors.email
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500"
                    }`}
                  />
                </div>
                {forgotErrors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {forgotErrors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSendingLink}
                className="mt-2 h-14 w-full rounded-2xl bg-[#2F56D9] px-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#2448bd] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isSendingLink ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-center text-sm text-slate-500">
                We’ll email a link to {watchForgot("email") || "your address"}.
              </p>
            </form>
          </>
        )}
        {sponsorOption && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl rounded-xl bg-white shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4">
                <h3 className="text-lg font-semibold">Select a category</h3>
                <button
                  onClick={() => setSponsorOption(false)}
                  className="cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-6">
                <p className="font-medium text-[20px] text-[#212121] mb-6 text-center">
                  Kindly select a category to initiate your involvement in the
                  scholarship program.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Single application tile */}
                  <button
                    type="button"
                    onClick={() => setSponsorType("Individual")}
                    className={
                      "w-full border border-[#e3e4e6] rounded-xl p-6 hover:bg-muted transition flex flex-col items-center justify-center" +
                      (sponsorType === "Individual"
                        ? " ring-2 ring-[#3062C8]"
                        : "")
                    }
                  >
                    <div className="w-12 h-12 rounded-full bg-[#246BFD14] flex items-center justify-center mb-3">
                      <User className="w-6 h-6 text-[#3062C8]" />
                    </div>
                    <div className="font-semibold">Individual Sponsor</div>
                    <div className="text-sm text-muted-foreground">
                      I want to find & support committed scholars
                    </div>
                  </button>

                  {/* Bulk application tile */}
                  <button
                    type="button"
                    onClick={() => setSponsorType("Corporate")}
                    className={
                      "w-full border border-[#e3e4e6] rounded-xl p-6 hover:bg-muted transition flex flex-col items-center justify-center" +
                      (sponsorType === "Corporate"
                        ? " ring-2 ring-[#3062C8]"
                        : "")
                    }
                  >
                    <div className="w-12 h-12 rounded-full bg-[#FF980014] bg-opacity-[8%] flex items-center justify-center mb-3">
                      <User className="w-6 h-6 text-[#FB9400]" />
                    </div>

                    <div className="font-semibold">Corporate Sponsor</div>
                    <div className="text-sm text-muted-foreground">
                      My organization wants to find and support committed
                      scholars
                    </div>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="px-6 py-4 flex justify-end gap-3">
                <button
                  className="bg-gray-500 text-white py-2 px-4 rounded-lg shadow"
                  onClick={() => setSponsorOption(false)}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSponsorStartup}
                  className="bg-[#3062C8] text-white py-2 px-4 rounded-lg shadow"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SponsorLogin;
