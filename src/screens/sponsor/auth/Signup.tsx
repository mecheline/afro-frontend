import React, { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, ChevronLeft } from "lucide-react";
import {
  useResendSponsorCodeMutation,
  useSponsorSignupMutation,
  useVerifySponsorEmailMutation,
} from "../../../redux/services/scholar/api";
import { useLocation, useNavigate } from "react-router";
import { toast } from "sonner";

// ------------------ Validation Schema ------------------
const formSchema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    // digits only, 7-14 after country code; adjust to your needs
    phone: z
      .string()
      .min(11, "Enter a valid phone number")
      .max(11, "Too long")
      .regex(/^[0-9]+$/, "Digits only"),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(
        /^(?=.*[A-Za-z])(?=.*[0-9]).{8,}$/,
        "Use letters and at least one number"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((vals) => vals.password === vals.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

// ------------------ Types ------------------
type FormValues = z.infer<typeof formSchema>;
const otpSchema = z.object({
  otp: z.string().regex(/^\d{5}$/, "Enter the 5-digit code"),
});

type OtpValues = z.infer<typeof otpSchema>;

type SponsorState = { type?: "Individual" | "Corporate" | string };

// ------------------ UI ------------------
export default function SponsorSignup() {
  const location = useLocation();
  const navigate = useNavigate();
  const sponsorType = (location.state as SponsorState | null)?.type;
  console.log(sponsorType);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [phase, setPhase] = useState<"signup" | "verify">("signup");
  const CODE_LEN = 5;
  const EXPIRE_SECONDS = 300; // 5 minutes

  const [signup] = useSponsorSignupMutation();
  const [verifyEmail] = useVerifySponsorEmailMutation();
  const [resendVerifyCode] = useResendSponsorCodeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (values: FormValues) => {
    /* const payload = {
      ...values,
      phone: `+234${values.phone}`, 
    }; */
    // Replace with your API call
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      phone: values.phone,
      password: values.password,
      sponsorType: sponsorType || "Individual",
    };
    console.log("SUBMIT:", values);
    try {
      const res = await signup(payload).unwrap();
      console.log(res);
      setPhase("verify");
    } catch (error) {
      console.log(error);
    }
  };

  // keep phone digits-only
  const phoneVal = watch("phone");
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

  const onVerifySubmit = async ({ otp }: OtpValues) => {
    if (isExpired) return; // guard
    const payload = { email: emailVal, code: otp };
    // TODO: replace with your API call:
    try {
      const response = await verifyEmail(payload).unwrap();
      console.log(response);
      navigate("/auth/sponsor/login");
    } catch (error: any) {
      toast.error(error?.data?.msg);
      console.log(error?.data?.msg);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto w-full max-w-md px-5 pb-10">
        {phase === "signup" ? (
          <div>
            <button
              type="button"
              aria-label="Go back"
              className="mt-6 inline-flex h-10 w-10 items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => window.history.back()}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <h1 className="mt-6 text-3xl font-semibold tracking-tight">
              Create New Account
            </h1>

            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
              {/* First Name */}
              <div>
                <input
                  placeholder="First Name"
                  className="h-12 w-full rounded-2xl bg-gray-100 px-4 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                  {...register("firstName")}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName.message as string}
                  </p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <input
                  placeholder="Last Name"
                  className="h-12 w-full rounded-2xl bg-gray-100 px-4 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                  {...register("lastName")}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.lastName.message as string}
                  </p>
                )}
              </div>

              {/* Email with icon (right) */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Email"
                    className="h-12 w-full rounded-2xl bg-gray-100 pr-11 px-4 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    {...register("email")}
                  />
                  <Mail className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message as string}
                  </p>
                )}
              </div>

              {/* Phone (NG only mock) */}
              <div>
                <div className="">
                  {/* Left prefix: flag + chevron + +234 */}
                  <input
                    inputMode="numeric"
                    placeholder="0816 503 3526"
                    className="h-12 w-full rounded-2xl bg-gray-100 px-4 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    {...register("phone")}
                    onChange={(e) => {
                      const onlyDigits = e.target.value.replace(/[^0-9]/g, "");
                      setValue("phone", onlyDigits, { shouldValidate: true });
                    }}
                    value={phoneVal}
                  />
                </div>
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.phone.message as string}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Password"
                    type={showPwd ? "text" : "password"}
                    className="h-12 w-full rounded-2xl bg-gray-100 pl-10 pr-11 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    aria-label={showPwd ? "Hide password" : "Show password"}
                    onClick={() => setShowPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPwd ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message as string}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    placeholder="Confirm Password"
                    type={showConfirmPwd ? "text" : "password"}
                    className="h-12 w-full rounded-2xl bg-gray-100 pl-10 pr-11 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPwd ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowConfirmPwd((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showConfirmPwd ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword.message as string}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="mt-2 h-12 w-full rounded-2xl bg-indigo-400 text-white transition hover:bg-indigo-500 disabled:opacity-60"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Sign up"}
              </button>

              <p className="text-center text-sm text-gray-500">
                Already have an account?{" "}
                <a
                  href="/auth/sponsor/login"
                  className="font-medium text-indigo-600 underline-offset-4 hover:underline"
                >
                  Sign in
                </a>
              </p>
            </form>
          </div>
        ) : (
          <>
            {/* Verify Title */}
            <h1 className="mt-24 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
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
      </div>
    </div>
  );
}
