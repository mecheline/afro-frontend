// src/features/dashboard/ScholarSummaryCards.tsx
import React from "react";

const Card: React.FC<{
  label: string;
  value?: number;
  loading?: boolean;
  tone?: "blue" | "green" | "gray";
}> = ({ label, value, loading, tone = "blue" }) => {
  console.log(tone);
  return (
    <div className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm`}>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        {loading ? (
          <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="text-2xl font-semibold">{value ?? 0}</div>
        )}
      </div>
    </div>
  );
};

export default Card;
