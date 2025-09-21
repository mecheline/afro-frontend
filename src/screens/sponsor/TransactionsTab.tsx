// src/features/dashboard/TransactionsTab.tsx
import React, { useMemo, useState, useEffect } from "react";
import {
  useGetTransactionsQuery,
  type TxQuery,
  type TxStatus,
  type TxType,
} from "../../redux/services/scholar/api";
import { useSearchParams } from "react-router";
import { fmtDate, fmtNGN } from "../../constants/Format";


// tiny debounce
function useDebouncedValue<T>(value: T, delay = 400) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const Pill: React.FC<{ status: TxStatus }> = ({ status }) => {
  const map: Record<TxStatus, string> = {
    success: "bg-green-100 text-green-700",
    failed: "bg-red-100 text-red-700",
    abandoned: "bg-yellow-100 text-yellow-800",
    pending: "bg-gray-100 text-gray-600",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${map[status]}`}>
      {status}
    </span>
  );
};
const typeLabel = (t: TxType) =>
  t === "funding" ? "Wallet Funding" : t === "refund" ? "Refund" : "Adjustment";

const STATUSES: TxStatus[] = ["success", "failed", "abandoned", "pending"];
//const TYPES: TxType[] = ["funding", "refund", "adjustment"];

export const TransactionsTab: React.FC = () => {
  const [sp, setSp] = useSearchParams();

  const [page, setPage] = useState<number>(
    parseInt(sp.get("page") || "1", 10) || 1
  );
  const [limit, setLimit] = useState<number>(
    parseInt(sp.get("limit") || "10", 10) || 10
  );
  const [q, setQ] = useState<string>(sp.get("q") || "");
  const [status, setStatus] = useState<TxStatus | "">(
    (sp.get("status") as TxStatus) || ""
  );
  const [type, setType] = useState<TxType | "">(
    (sp.get("type") as TxType) || ""
  );
  const [dateFrom, setDateFrom] = useState<string>(sp.get("dateFrom") || "");
  const [dateTo, setDateTo] = useState<string>(sp.get("dateTo") || "");

  const qDeb = useDebouncedValue(q, 400);

  const query: TxQuery = useMemo(
    () => ({
      page,
      limit,
      q: qDeb || undefined,
      status: (status || undefined) as TxStatus | undefined,
      type: (type || undefined) as TxType | undefined,
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    }),
    [page, limit, qDeb, status, type, dateFrom, dateTo]
  );

  const { data, isLoading, isError } = useGetTransactionsQuery(query);
  const rows = data?.data ?? [];
  const meta = data?.meta ?? { page, limit, total: 0 };

  // URL sync
  useEffect(() => {
    const p = new URLSearchParams();
    p.set("page", String(page));
    p.set("limit", String(limit));
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    if (type) p.set("type", type);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    setSp(p, { replace: true });
  }, [page, limit, q, status, type, dateFrom, dateTo, setSp]);

  // Reset to first page when filters/search change
  useEffect(() => {
    setPage(1);
  }, [qDeb, status, type, dateFrom, dateTo, limit]);

  return (
    <div className="space-y-4">
      <div className="font-bold text-[40px] mb-8">Transactions</div>
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
              placeholder="Search ref / message / scholarship"
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
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/*  <div className="sm:w-44">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full rounded-md border px-3 py-2"
            >
              <option value="">All</option>
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeLabel(t)}
                </option>
              ))}
            </select>
          </div> */}

          <div className="sm:w-44">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Date from
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>

          <div className="sm:w-44">
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Date to
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-md border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button
            className="rounded-md border px-3 py-2 text-sm"
            onClick={() => {
              setQ("");
              setStatus("");
              setType("");
              setDateFrom("");
              setDateTo("");
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
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Scholarship</th>
              <th className="px-4 py-3">Ref / Message</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Amount</th>
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
                  Failed to load transactions.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                  No transactions found.
                </td>
              </tr>
            ) : (
              rows.map((t) => (
                <tr key={t._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-700">
                    {fmtDate(t.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {typeLabel(t.type)}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {t.scholarshipTitle || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {t.message || t.ref}
                  </td>
                  <td className="px-4 py-3">
                    <Pill status={t.status} />
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {fmtNGN(Math.max(0, t.amount || 0))}
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
              const last = Math.max(
                1,
                Math.ceil((meta.total || 0) / (meta.limit || 10))
              );
              setPage((p) => Math.min(last, p + 1));
            }}
            disabled={
              meta.page >=
              Math.max(1, Math.ceil((meta.total || 0) / (meta.limit || 10)))
            }
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTab;
