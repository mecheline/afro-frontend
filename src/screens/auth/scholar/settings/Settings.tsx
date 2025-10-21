// src/modules/scholar/dashboard/settings/Settings.tsx
"use client";


import { useState } from "react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

import {
  useGetDeactivationRequestQuery,
  useRequestDeactivationMutation,
} from "../../../../redux/services/scholar/api";
import { toast } from "sonner";

export default function SettingsPage() {
  const { data } = useGetDeactivationRequestQuery();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [checked, setChecked] = useState(false);
  const [requestDeactivation, { isLoading: isSubmitting }] =
    useRequestDeactivationMutation();

  const pending = data?.deactivationRequest?.status === "Pending";
  const inactive = data?.status === "Inactive";

  const onSubmit = async () => {
    try {
      if (!reason.trim()) return alert("Please provide a reason.");
      await requestDeactivation({ reason: reason.trim() }).unwrap();
      setOpen(false);
      setReason("");
      setChecked(false);
      toast.success("Request submitted. Admin will review it.");
    } catch (e: any) {
      toast.error(e?.data?.message || "Unable to submit request");
    }
  };

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage your account preferences.
        </p>
      </header>

      {/* Other settings blocks can go here... */}

      {/* Danger Zone */}
      <section className="rounded-lg border border-gray-200 p-4">
        <h2 className="mb-1 text-lg font-medium text-black">Danger Zone</h2>
        <p className="text-sm text-black">
          Request to deactivate your account. An admin will review and disable
          your account if approved.
        </p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div className="text-sm">
            <div>
              <span className="font-medium">Current status:</span>{" "}
              <span
                className={cn(
                  "rounded px-2 py-0.5",
                  inactive
                    ? "bg-gray-200 text-gray-900"
                    : "bg-green-200 text-green-900"
                )}
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
            className={cn(
              "inline-flex items-center rounded-md border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            )}
          >
            Deactivate account
          </button>
        </div>
      </section>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setOpen(false)}
          />

          <div className="relative z-10 w-[95%] max-w-lg rounded-lg border border-gray-200 bg-white p-5 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">
              Request account deactivation
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Tell us why you want to deactivate your account. Your request will
              be sent to the admin for review.
            </p>

            <label className="mt-4 block text-sm font-medium">Reason</label>
            <textarea
              rows={5}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Briefly describe your reason…"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white p-2 text-sm outline-none"
            />

            <label className="mt-3 inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="size-4"
              />
              I understand my request must be approved by an admin before my
              account is disabled.
            </label>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                disabled={!checked || !reason.trim() || isSubmitting}
                onClick={onSubmit}
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
