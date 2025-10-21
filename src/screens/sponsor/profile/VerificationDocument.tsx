"use client";

import * as React from "react";
import StepFooter from "./StepFooter";
import useProfileStepNav from "./useProfileStepNav";
import {
  useGetStepQuery,
  useUploadVerificationMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";
import { CloudUpload } from "lucide-react";

type StepProps = { onPrev?: () => void; onNext?: () => void; step?: number };

const ID_TYPES = [
  "Intl passport",
  "Drivers Licence",
  "NIN",
  "National ID Card",
];

export default function VerificationDocument({
  onPrev,
  onNext,
  step,
}: StepProps) {
  const nav = useProfileStepNav();

  // fetch existing step data
  const {
    data: stepData,
    isFetching,
    refetch,
  } = useGetStepQuery("verification");

  // derive existing fields (handle either {verificationDocument: {...}} or flat return)
  const existing = stepData?.verificationDocument ?? stepData ?? null;
  const existingUrl: string = existing?.uploadURL ?? "";
  const existingIdType: string = existing?.idType ?? "";

  const [idType, setIdType] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [agree, setAgree] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Are we editing/replacing the existing document?
  const [isChanging, setIsChanging] = React.useState(false);

  // mutation
  const [upload, { isLoading }] = useUploadVerificationMutation();

  // prefill from server
  React.useEffect(() => {
    if (existing) {
      setIdType(existingIdType || "");
      // show "keep current" mode by default if we have an existing file
      setIsChanging(!existingUrl);
    }
  }, [existingIdType, existingUrl, existing]);

  const startChange = () => {
    setIsChanging(true);
    setFile(null);
    setError(null);
  };

  const cancelChange = () => {
    setIsChanging(false);
    setFile(null);
    setError(null);
    // restore idType to what server has (in case user changed it)
    setIdType(existingIdType || "");
  };

  const mustUpload = !existingUrl || isChanging; // require file only if no existing OR user chose to change

  const submitAndNext = async () => {
    setError(null);

    if (!idType) return setError("Please select an ID Type");
    if (!agree) return setError("You must agree to proceed");

    // If user is not changing and we already have a document, allow proceed without upload
    if (!mustUpload) {
      (onNext ?? nav.goNext)();
      return;
    }

    if (!file) return setError("Kindly upload an ID card to proceed");

    await upload({ idType, file }).unwrap();
    toast.success("Verification document uploaded");
    await refetch();
    setIsChanging(false);
    (onNext ?? nav.goNext)();
  };

  const saveOnly = async () => {
    setError(null);

    // If not changing and we have an existing doc, nothing to save
    if (!mustUpload) return;

    if (!idType || !file) return; // allow silent save only with both present
    await upload({ idType, file }).unwrap();
    toast.success("Verification document saved");
    await refetch();
    setIsChanging(false);
  };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-semibold">Verification Document</h1>

      <label className="mt-3 block text-sm">
        ID Type{" "}
        <span className="text-gray-400">
          (Intl passport, Drivers Licence, NIN, National ID Card)
        </span>
      </label>
      <select
        className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
        value={idType}
        onChange={(e) => setIdType(e.target.value)}
        disabled={isFetching || (!isChanging && !!existingUrl)} // lock when keeping current doc
      >
        <option value="">Select</option>
        {ID_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* If there is an existing document and we're not in "change" mode, show it with a Change button */}
      {existingUrl && !isChanging && (
        <div className="mt-4 rounded-md border border-gray-200 p-3 text-sm">
          <div className="flex items-center justify-center gap-3">
            {/\.(png|pdf|jpe?g|gif|webp)$/i.test(existingUrl) ? (
              <img
                src={existingUrl}
                alt="Current ID"
                className="h-20 w-20 rounded object-cover"
              />
            ) : null}
            <a
              href={existingUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-600 hover:underline break-all"
            >
              View
            </a>
          </div>

          <button
            type="button"
            onClick={startChange}
            className="mt-3 inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Change document
          </button>
        </div>
      )}

      {/* Upload interface (shown if no existing doc OR user clicked "Change") */}
      {mustUpload && (
        <div className="mt-5">
          <label className="block text-sm">Upload ID</label>
          <label className="mt-2 flex h-40 cursor-pointer items-center justify-center rounded-lg border border-dashed">
            <input
              type="file"
              className="hidden"
              accept="image/*,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isFetching}
            />
            <div className="text-center text-gray-500">
              <div className="mx-auto mb-2 h-10 w-10 rounded-md bg-blue-50 p-2">
                <CloudUpload />
              </div>
              <div>Browse File</div>
              {file && (
                <div className="mt-1 max-w-xs truncate text-xs text-gray-600">
                  {file.name}
                </div>
              )}
            </div>
          </label>

          {existingUrl && (
            <button
              type="button"
              onClick={cancelChange}
              className="mt-3 inline-flex items-center rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              Keep current document
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-3 rounded-md bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={agree}
          onChange={(e) => setAgree(e.target.checked)}
        />
        <span>
          I Agree to Afroscholar{" "}
          <a className="text-blue-600 underline">terms &amp; condition</a> and{" "}
          <a className="text-blue-600 underline">privacy policy</a>
        </span>
      </label>

      <StepFooter
        prevDisabled={nav.isFirst}
        nextDisabled={isLoading}
        onPrev={onPrev ?? nav.goPrev}
        onNext={submitAndNext}
        onSaveLater={saveOnly}
        step={step}
      />
    </div>
  );
}
