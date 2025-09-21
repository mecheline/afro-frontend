// src/features/dashboard/SponsorDashboard.tsx
import React, { useState } from "react";
import { TransactionsTab } from "./TransactionsTab";
import { ScholarshipsTab } from "./ScholarshipsTab";


const SponsorDashboard: React.FC = () => {
  const [tab, setTab] = useState<"transactions" | "scholarships">(
    "transactions"
  );

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold md:text-2xl">Dashboard</h1>
        <div className="text-sm text-gray-500">Sponsor</div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="-mb-px flex gap-6">
          <button
            className={`border-b-2 pb-2 text-sm font-medium transition ${
              tab === "scholarships"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setTab("scholarships")}
          >
            Scholarships
          </button>
          <button
            className={`border-b-2 pb-2 text-sm font-medium transition ${
              tab === "transactions"
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-gray-500"
            }`}
            onClick={() => setTab("transactions")}
          >
            Transactions
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-4">
        {tab === "transactions" ? <TransactionsTab /> : <ScholarshipsTab />}
      </div>
    </div>
  );
};

export default SponsorDashboard;
