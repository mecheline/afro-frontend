// src/features/dashboard/ScholarshipsTab.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  useGetMyScholarshipsQuery,
  useGetScholarshipStatsQuery,
  type ScholarshipsQuery,
} from "../../redux/services/scholar/api";

import { Link, useSearchParams } from "react-router";
import useDebouncedValue from "../../hooks/useDebouncedValue";
import { fmtDate } from "../../constants/Format";
import Card from "./SummaryCards";
import { Plus } from "lucide-react";

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
      active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
    }`}
  >
    {active ? "Active" : "Draft"}
  </span>
);

const categories = ["Secondary", "WASSCE", "Undergraduate", "Masters", "PHD"];
const methods = ["SelfSelection", "MatchedScholar"] as const;

export const ScholarshipsTab: React.FC = () => {
  // URL <-> state sync
  const [sp, setSp] = useSearchParams();
  const [page, setPage] = useState<number>(
    parseInt(sp.get("page") || "1", 10) || 1
  );
  const [limit, setLimit] = useState<number>(
    parseInt(sp.get("limit") || "10", 10) || 10
  );
  const [q, setQ] = useState<string>(sp.get("q") || "");
  const [status, setStatus] = useState<"active" | "draft" | "">(
    (sp.get("status") as any) || ""
  );
  const [category, setCategory] = useState<string>(sp.get("category") || "");
  const [method, setMethod] = useState<"SelfSelection" | "MatchedScholar" | "">(
    (sp.get("method") as any) || ""
  );

  // Debounce the search
  const qDeb = useDebouncedValue(q, 400);

  // Build query object
  const query: ScholarshipsQuery = useMemo(
    () => ({
      page,
      limit,
      q: qDeb || undefined,
      status: status || undefined,
      category: category || undefined,
      method: (method || undefined) as any,
    }),
    [page, limit, qDeb, status, category, method]
  );

  // Fetch
  const { data, isLoading, isError } = useGetMyScholarshipsQuery(query);

  const rows = data?.data ?? [];
  const meta = data?.meta ?? { page, limit, total: 0 };

  // NEW: fetch stats (total/active/draft)
  const { data: stats, isLoading: statsLoading } =
    useGetScholarshipStatsQuery();

  // Keep URL in sync (nice for refresh/back/forward)
  useEffect(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    if (category) params.set("category", category);
    if (method) params.set("method", method);
    setSp(params, { replace: true });
  }, [page, limit, q, status, category, method, setSp]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [qDeb, status, category, method, limit]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="font-bold text-[40px]">Scholarships</div>
          <div className="flex items-center space-x-2">
            <div className="font-medium text-lg">Total:</div>
            <span className="font-extralight">
              {data?.meta?.total}
            </span>
          </div>
        </div>
        <button className=" bg-[#3062C8] text-white p-2 rounded-lg">
          <Link to={"/sponsor/scholarships/create"} className="flex gap-2">
            <Plus />
            Add New Scholarship
          </Link>
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card
          label="Total scholarships"
          value={stats?.total}
          loading={statsLoading}
          tone="blue"
        />
        <Card
          label="Active"
          value={stats?.active}
          loading={statsLoading}
          tone="green"
        />
        <Card
          label="Draft"
          value={stats?.draft}
          loading={statsLoading}
          tone="gray"
        />
      </div>
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row">
          <div className="sm:w-64">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Search
            </label>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search title / category"
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="sm:w-40">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="sm:w-48">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-56">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Selection Method
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as any)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              {methods.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => {
              setQ("");
              setStatus("");
              setCategory("");
              setMethod("");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full whitespace-nowrap text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-600">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Selection Method</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  Loading…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-red-600">
                  Failed to load scholarships.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No scholarships found.
                </td>
              </tr>
            ) : (
              rows.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {s.title}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{s.category}</td>
                  <td className="px-4 py-3 text-gray-700">
                    {s.selectionMethod ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge active={s.active} />
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {fmtDate(s.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <a
                        className="inline-flex items-center rounded-md border px-3 py-1.5 text-blue-700 hover:bg-blue-50"
                        href={`/sponsor/scholarships/${s._id}/edit`} // resume where they stopped
                      >
                        Manage
                      </a>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
        <div className="text-xs text-gray-500">
          {meta.total > 0 ? (
            <>
              Showing <b>{(meta.page - 1) * meta.limit + 1}</b>–
              <b>{Math.min(meta.page * meta.limit, meta.total)}</b> of{" "}
              <b>{meta.total}</b>
            </>
          ) : (
            "No results"
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            value={limit}
            onChange={(e) => setLimit(parseInt(e.target.value, 10))}
            className="rounded-md border px-2 py-1 text-sm"
          >
            {[10, 20, 50].map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={meta.page <= 1}
          >
            Prev
          </button>
          <span className="text-sm">{meta.page}</span>
          <button
            className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-50"
            onClick={() => {
              const last = Math.max(1, Math.ceil(meta.total / meta.limit || 1));
              setPage((p) => Math.min(last, p + 1));
            }}
            disabled={
              meta.page >= Math.max(1, Math.ceil(meta.total / meta.limit || 1))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipsTab;
