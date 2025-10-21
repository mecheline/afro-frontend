// src/modules/sponsor/dashboard/settings/Settings.tsx
"use client";

import * as React from "react";
import { useState } from "react";
import {
  useGetSponsorDeactivationRequestQuery,
  useRequestSponsorDeactivationMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";

export default function SponsorSettingsPage() {
  const { data, isLoading } = useGetSponsorDeactivationRequestQuery();
  const [reason, setReason] = useState("");
  const [ack, setAck] = useState(false);
  const [open, setOpen] = useState(false);
  const [requestDeactivation, { isLoading: isSubmitting }] =
    useRequestSponsorDeactivationMutation();

  const pending = data?.deactivationRequest?.status === "Pending";
  const inactive = data?.status === "Inactive";

  const submit = async () => {
    if (!reason.trim()) return alert("Please provide a reason.");
    try {
      await requestDeactivation({ reason: reason.trim() }).unwrap();
      setOpen(false);
      setReason("");
      setAck(false);
      toast.success("Request submitted. Admin will review it.");
    } catch (e: any) {
      toast.error(e?.data?.message || "Unable to submit request.");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">Manage your sponsor account.</p>
      </header>

      {/* Danger Zone */}
      <section className="rounded-lg border border-gray-300 p-4">
        <h2 className="mb-1 text-lg text-red-700 font-medium">
          Danger Zone
        </h2>
        <p className="text-sm">
          Request to deactivate your account. An admin will review and disable
          your account if approved.
        </p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-sm">
            <div>
              <span className="font-medium">Current status:</span>{" "}
              <span
                className={`rounded px-2 py-0.5 ${
                  inactive
                    ? "bg-gray-200 text-gray-900"
                    : "bg-green-200 text-green-900"
                }`}
              >
                {data?.status ?? "—"}
              </span>
            </div>
            {pending && (
              <div className="mt-1 text-amber-700">
                A deactivation request is pending review.
              </div>
            )}
          </div>

          <button
            disabled={pending || inactive}
            onClick={() => setOpen(true)}
            className="inline-flex items-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Deactivate account
          </button>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-[95%] max-w-lg rounded-lg border border-gray-200 bg-white p-5 shadow-xl dark:border-gray-800 dark:bg-gray-900">
            <h3 className="text-lg font-semibold">
              Request account deactivation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tell us why you want to deactivate your sponsor account.
            </p>
            <label className="mt-4 block text-sm font-medium">Reason</label>
            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your reason…"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-950"
            />
            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={ack}
                onChange={(e) => setAck(e.target.checked)}
                className="size-4"
              />
              I understand my request must be approved by an admin before my
              account is disabled.
            </label>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                disabled={!ack || !reason.trim() || isSubmitting}
                onClick={submit}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Submitting…" : "Submit request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
