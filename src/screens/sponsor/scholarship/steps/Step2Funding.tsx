// src/features/scholarships/steps/Step2Funding.tsx
import React from "react";
import { useForm } from "react-hook-form";
import type { FundingPlanKey } from "../../../../redux/services/scholar/api";

type FormVals = { plan: FundingPlanKey; amount: number; agree: boolean };

type Props = {
  formId?: string;
  hideButtons?: boolean; // <-- add this
  paid: boolean;
  initialPlan?: FundingPlanKey;
  initialAmount?: number;
  onInit: (plan: FundingPlanKey, amount: number) => Promise<void>;
  onContinue: () => Promise<void>;
  onBack: () => void;
};

export default function Step2Funding({
  formId,
  hideButtons,
  paid,
  initialPlan,
  initialAmount,
  onInit,
  onContinue,
  onBack,
}: Props) {
  const { register, handleSubmit, watch, setValue } = useForm<FormVals>({
    defaultValues: {
      plan: initialPlan ?? "ANNUAL",
      amount: initialAmount ?? 350000,
      agree: false,
    },
  });

  // Quick plan cards (tap to set)
  const PlanCard: React.FC<{
    label: string;
    plan: FundingPlanKey;
    amount: number;
  }> = ({ label, plan, amount }) => (
    <button
      type="button"
      className={`rounded-xl border p-4 text-left ${
        watch("plan") === plan ? "border-blue-600" : "border-gray-300"
      }`}
      onClick={() => {
        setValue("plan", plan);
        setValue("amount", amount);
      }}
    >
      <div className="text-lg font-semibold">{label}</div>
      <div className="text-sm text-gray-500">
        Scholarship goes live when wallet is fully funded.
      </div>
    </button>
  );

  if (paid) {
    return (
      <div className="space-y-4">
        <div className="rounded-md border border-green-300 bg-green-50 p-3 text-green-700">
          Payment verified ✓
        </div>
        {!hideButtons && (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onBack}
              className="rounded-md border p-3"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-md bg-blue-600 p-3 text-white"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(async (v) => {
        if (!v.agree) return;
        await onInit(v.plan, v.amount);
      })}
      className="space-y-4 sponsorLabel"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <PlanCard label="₦1.4m / 4 years" plan="FOUR_YEARS" amount={1400000} />
        <PlanCard label="₦350,000 / annum" plan="ANNUAL" amount={350000} />
        <PlanCard label="₦180,000 / quarter" plan="QUARTERLY" amount={180000} />
        <PlanCard label="₦30,000 / month" plan="MONTHLY" amount={30000} />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" {...register("agree", { required: true })} /> I
        agree to Afroscholar terms & privacy policy
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={onBack}
          className="rounded-md border p-3"
        >
          Back
        </button>
        <button className="rounded-md bg-blue-600 p-3 text-white">
          Fund Scholarship
        </button>
      </div>
    </form>
  );
}
