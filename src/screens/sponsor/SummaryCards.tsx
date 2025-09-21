// src/features/dashboard/ScholarSummaryCards.tsx
import React from "react";

const Card: React.FC<{
  label: string;
  value?: number;
  loading?: boolean;
  tone?: "blue" | "green" | "gray";
}> = ({ label, value, loading, tone = "blue" }) => {
  const ring =
    tone === "green"
      ? "ring-1 ring-green-100"
      : tone === "gray"
      ? "ring-1 ring-gray-100"
      : "ring-1 ring-blue-100";
  const badge =
    tone === "green"
      ? "bg-green-50 text-green-700"
      : tone === "gray"
      ? "bg-gray-50 text-gray-700"
      : "bg-blue-50 text-blue-700";

  return (
    <div className={`rounded-xl border bg-white ${ring} p-4 shadow-sm`}>
      <div className="text-xs font-medium text-gray-500">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        {loading ? (
          <div className="h-6 w-12 animate-pulse rounded bg-gray-100" />
        ) : (
          <div className="text-2xl font-semibold">{value ?? 0}</div>
        )}
        <span className={`rounded-full px-2 py-0.5 text-xs ${badge}`}>
          count
        </span>
      </div>
    </div>
  );
};

export default Card;
