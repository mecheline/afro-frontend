// src/screens/auth/CreateAccountRHF.tsx
import React, { useRef, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router";
import logo from "../../../assets/logo.png";
import {
  useResendCodeMutation,
  useSignupMutation,
  useVerifyEmailMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";

const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const otpSchema = z.object({
  otp: z.string().regex(/^\d{5}$/, "Enter the 5-digit code"),
});

type SignupValues = z.infer<typeof signupSchema>;
type OtpValues = z.infer<typeof otpSchema>;

const CODE_LEN = 5;
const EXPIRE_SECONDS = 300; // 5 minutes

const ScholarSignup: React.FC = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [phase, setPhase] = useState<"signup" | "verify">("signup");

  // top-level inside component
  const timerRef = useRef<number | null>(null);
  const deadlineRef = useRef<number | null>(null);

  const startCountdown = () => {
    // clear any existing timer (idempotent even under StrictMode)
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    // set a fixed deadline 5 minutes from now
    deadlineRef.current = Date.now() + EXPIRE_SECONDS * 1000;
    // set immediate UI state
    setLeft(EXPIRE_SECONDS);

    // tick every second toward the deadline
    timerRef.current = window.setInterval(() => {
      if (!deadlineRef.current) return;
      const remaining = Math.max(
        0,
        Math.ceil((deadlineRef.current - Date.now()) / 1000)
      );
      setLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerRef.current!);
        timerRef.current = null;
      }
    }, 1000);
  };

  //mutations and queries

  const [signup] = useSignupMutation();
  const [verifyEmail] = useVerifyEmailMutation();
  const [resendVerifyCode] = useResendCodeMutation();

  // -------- FORM 1: signup --------
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  const emailVal = watch("email");

  // -------- FORM 2: OTP-only --------
  const {
    handleSubmit: handleOtpSubmit,
    setValue: setOtpValue,
    formState: { errors: otpErrors, isSubmitting: isVerifying },
  } = useForm<OtpValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
    mode: "onTouched",
  });

  // OTP digits state + refs
  const [digits, setDigits] = useState<string[]>(Array(CODE_LEN).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setOtpValue("otp", digits.join(""), { shouldValidate: true });
  }, [digits, setOtpValue]);

  const focusIndex = (i: number) => {
    inputsRef.current[i]?.focus();
    inputsRef.current[i]?.select();
  };

  const handleDigitChange = (i: number, v: string) => {
    const d = v.replace(/\D/g, "");
    if (!d) {
      setDigits((p) => {
        const c = [...p];
        c[i] = "";
        return c;
      });
      return;
    }
    setDigits((p) => {
      const c = [...p];
      c[i] = d[0];
      let idx = i + 1;
      for (let k = 1; k < d.length && idx < CODE_LEN; k++, idx++) c[idx] = d[k];
      const next = Math.min(CODE_LEN - 1, i + d.length);
      setTimeout(() => focusIndex(next));
      return c;
    });
  };

  const handleDigitKey = (
    i: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace") {
      if (digits[i]) {
        setDigits((p) => {
          const c = [...p];
          c[i] = "";
          return c;
        });
      } else if (i > 0) {
        setTimeout(() => focusIndex(i - 1));
        setDigits((p) => {
          const c = [...p];
          c[i - 1] = "";
          return c;
        });
      }
    }
    if (e.key === "ArrowLeft" && i > 0) setTimeout(() => focusIndex(i - 1));
    if (e.key === "ArrowRight" && i < CODE_LEN - 1)
      setTimeout(() => focusIndex(i + 1));
  };

  const handleDigitPaste = (
    i: number,
    e: React.ClipboardEvent<HTMLInputElement>
  ) => {
    e.preventDefault();
    const txt = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, CODE_LEN);
    if (!txt) return;
    setDigits((p) => {
      const c = [...p];
      let idx = i;
      for (let k = 0; k < txt.length && idx < CODE_LEN; k++, idx++)
        c[idx] = txt[k];
      setTimeout(() => focusIndex(Math.min(CODE_LEN - 1, i + txt.length - 1)));
      return c;
    });
  };

  // -------- Expiry timer + resend --------
  const [left, setLeft] = useState<number>(0);
  const [resending, setResending] = useState(false);
  const isExpired = left <= 0;

  // Start/reset timer ONLY when we enter verify; clean up on exit/unmount
  useEffect(() => {
    if (phase === "verify") {
      setDigits(Array(CODE_LEN).fill(""));
      setTimeout(() => focusIndex(0), 0);
      startCountdown();
    } else {
      // leaving verify: stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      deadlineRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [phase]);

  const formatMMSS = (s: number) => {
    const m = Math.floor(s / 60)
      .toString()
      .padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  const handleResend = async () => {
    try {
      setResending(true);
      const response = await resendVerifyCode({ email: emailVal }).unwrap();
      console.log(response);

      // clear inputs and restart 5-min window
      setDigits(Array(CODE_LEN).fill(""));
      setTimeout(() => focusIndex(0), 0);
      startCountdown();
    } finally {
      setResending(false);
    }
  };

  // -------- Submit handlers --------
  const onSignupSubmit = async (values: SignupValues) => {
    // TODO: replace with your API call:
    // await signupScholar(values)
    try {
      const response = await signup(values).unwrap();
      console.log(response);
      toast.success(response?.msg);
      setPhase("verify");
    } catch (error:any) {
      console.log(error);
      toast.error(error?.data?.msg);
    }
  };

  const onVerifySubmit = async ({ otp }: OtpValues) => {
    if (isExpired) return; // guard
    const payload = { email: emailVal, code: otp };
    // TODO: replace with your API call:
    try {
      const response = await verifyEmail(payload).unwrap();
      console.log(response);
      toast.success(response?.msg);
      navigate("/auth/scholar/login");
    } catch (error: any) {
      toast.error(error?.data?.msg);
      console.log(error?.data?.msg);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Top bar */}
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:pt-6">
        <button
          aria-label="Go back"
          onClick={() => {
            if (phase === "verify") setPhase("signup");
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
          <img src={logo} alt="logo" className="mx-auto cursor-pointer" />
        </Link>

        {phase === "signup" ? (
          <>
            {/* Title */}
            <h1 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Create New Account
            </h1>

            {/* Signup form */}
            <form
              onSubmit={handleSubmit(onSignupSubmit)}
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
                    autoComplete="new-password"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 h-14 w-full rounded-2xl bg-[#2F56D9] px-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#2448bd] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isSubmitting ? "Please wait..." : "Sign up"}
              </button>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="h-px w-full bg-slate-200" />
                </div>
              </div>

              {/* Bottom link */}
              <p className="pt-6 text-center text-base text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/auth/scholar/login"
                  className="font-semibold text-[#2F56D9] hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          </>
        ) : (
          <>
            {/* Verify Title */}
            <h1 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Verify your email
            </h1>
            <p className="mt-2 text-center text-slate-500">
              Enter the 5-digit code we sent to{" "}
              <span className="font-semibold">{emailVal}</span>
            </p>

            {/* OTP-only form */}
            <form
              onSubmit={handleOtpSubmit(onVerifySubmit)}
              className="mx-auto mt-8 w-full max-w-md space-y-6"
            >
              <div className="flex items-center justify-between gap-2">
                {Array.from({ length: CODE_LEN }).map((_, i) => (
                  <input
                    key={i}
                    inputMode="numeric"
                    maxLength={1}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={digits[i]}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleDigitKey(i, e)}
                    onPaste={(e) => handleDigitPaste(i, e)}
                    disabled={isExpired}
                    className={`h-14 w-12 rounded-2xl border text-center text-xl tracking-widest shadow-sm focus:outline-none focus:ring-4 sm:h-16 sm:w-14 ${
                      otpErrors.otp
                        ? "border-red-400 focus:ring-red-100"
                        : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-100"
                    } ${
                      isExpired
                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                        : ""
                    }`}
                  />
                ))}
              </div>
              {/* hidden field bound to RHF */}
              <input type="hidden" value={digits.join("")} readOnly />

              {/* Timer + Resend */}
              <div className="mt-1 flex items-center justify-between text-sm">
                <span
                  className={
                    isExpired ? "text-red-600 font-medium" : "text-slate-500"
                  }
                >
                  {isExpired
                    ? "Code expired. Please resend."
                    : `Code expires in ${formatMMSS(left)}`}
                </span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending || !isExpired}
                  className="font-medium text-indigo-600 hover:underline disabled:opacity-60"
                >
                  {resending ? "Resending..." : "Resend code"}
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifying || isExpired}
                className="h-14 w-full rounded-2xl bg-[#2F56D9] px-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#2448bd] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
              >
                {isVerifying ? "Verifying..." : "Verify Email"}
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
};

export default ScholarSignup;
