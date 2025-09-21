// src/components/StepperHorizontal.tsx
import React from "react";

type Step = { key: string; label: string };

export const StepperHorizontal: React.FC<{
  steps: Step[];
  currentIndex: number; // 0-based
  onStepClick?: (i: number) => void; // optional (disable if you don’t want jumping)
}> = ({ steps, currentIndex, onStepClick }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2">
        {steps.map((s, i) => {
          const isDone = i < currentIndex;
          const isCurrent = i === currentIndex;
          const statusClass = isDone
            ? "bg-blue-600"
            : isCurrent
            ? "bg-blue-500"
            : "bg-gray-200";

          return (
            <div key={s.key} className="flex-1">
              <button
                type="button"
                onClick={() => onStepClick?.(i)}
                disabled={!onStepClick}
                aria-current={isCurrent ? "step" : undefined}
                className={[
                  "h-2 w-full rounded-full transition-all",
                  statusClass,
                  onStepClick ? "cursor-pointer" : "cursor-default",
                ].join(" ")}
                title={s.label}
              />
              <div
                className={`mt-2 text-base text-center ${
                  isCurrent
                    ? "font-medium text-[#3062C8] text-base"
                    : "font-normal text-gray-600"
                }`}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>

      {/* tiny numeric breadcrumbs under bars (optional) */}
      {/* <div className="mt-2 flex justify-between text-[10px] text-gray-400">
        {steps.map((_, i) => (
          <div key={i} className="w-6 text-center mx-auto">
            {i + 1}
          </div>
        ))}
      </div> */}
    </div>
  );
};

export default StepperHorizontal;
