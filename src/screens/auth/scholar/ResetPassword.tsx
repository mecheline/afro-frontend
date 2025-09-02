import { useForm } from "react-hook-form";
import { useSearchParams, useNavigate, Link } from "react-router";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "../../../redux/services/scholar/api";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import logo from "../../../assets/logo.png";
import { toast } from "sonner";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get("token") || "";
  console.log(tokenFromQuery);

  const [resetPassword] = useResetPasswordMutation();

  const resetSchema = z
    .object({
      password: z.string().min(6, "At least 6 characters"),
      confirm: z.string().min(6, "At least 6 characters"),
    })
    .refine((v) => v.password === v.confirm, {
      message: "Passwords do not match",
      path: ["confirm"],
    });

  // ---------- Types ----------

  type ResetValues = z.infer<typeof resetSchema>;

  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors, isSubmitting: isResetting },
  } = useForm<ResetValues>({
    resolver: zodResolver(resetSchema),
    defaultValues: { password: "", confirm: "" },
    mode: "onTouched",
  });

  const onResetSubmit = async (values: ResetValues) => {
    const payload = { token: tokenFromQuery, newPassword: values.password };
    // Guard: require token in URL
    if (!tokenFromQuery) return;
    // TODO: call your "reset password" API, e.g. await resetPassword(payload)
    try {
      const response = await resetPassword(payload).unwrap();
      console.log(response);
      toast.success(response?.msg)
      navigate("/auth/scholar/login");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-white overflow-x-hidden mx-auto max-w-3xl px-4 pt-4 sm:pt-6">
      <main className="mx-auto grid max-w-3xl grid-cols-1 px-4 pb-16 pt-16 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to={"/"}>
          <img
            src={logo}
            alt="logo"
            className="flex items-center justify-center mx-auto cursor-pointer"
          />
        </Link>
        <h1 className="mt-8 text-center text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Reset password
        </h1>
        <p className="mt-2 text-center text-slate-500">
          Enter your new password.
        </p>

        {!tokenFromQuery && (
          <div className="mx-auto mt-4 w-full max-w-xl rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
            No token found in the URL. Open this page via the reset link in your
            email (it contains <code>?token=...</code>).
          </div>
        )}

        <form
          onSubmit={handleResetSubmit(onResetSubmit)}
          className="mx-auto mt-8 w-full max-w-xl space-y-4"
        >
          {/* New password */}
          <div>
            <label htmlFor="new-password" className="sr-only">
              New password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                autoComplete="new-password"
                {...registerReset("password")}
                aria-invalid={!!resetErrors.password}
                className={`h-14 w-full rounded-2xl border bg-slate-50/60 pl-11 pr-11 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                  resetErrors.password
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                onClick={() => setShowNewPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {resetErrors.password && (
              <p className="mt-1 text-sm text-red-600">
                {resetErrors.password.message}
              </p>
            )}
          </div>

          {/* Confirm new password */}
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                autoComplete="new-password"
                {...registerReset("confirm")}
                aria-invalid={!!resetErrors.confirm}
                className={`h-14 w-full rounded-2xl border bg-slate-50/60 pl-11 pr-11 text-base text-slate-900 placeholder:text-slate-400 shadow-sm focus:bg-white focus:outline-none focus:ring-4 ${
                  resetErrors.confirm
                    ? "border-red-400 focus:ring-red-100"
                    : "border-slate-200 focus:ring-indigo-100 focus:border-indigo-500"
                }`}
              />
              <button
                type="button"
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
                onClick={() => setShowConfirmPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {resetErrors.confirm && (
              <p className="mt-1 text-sm text-red-600">
                {resetErrors.confirm.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isResetting || !tokenFromQuery}
            className="mt-2 h-14 w-full rounded-2xl bg-[#2F56D9] px-6 text-lg font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-[#2448bd] focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:opacity-70"
          >
            {isResetting ? "Resetting..." : "Reset password"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ResetPassword;
