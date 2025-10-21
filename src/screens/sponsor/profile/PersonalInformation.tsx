// src/modules/sponsor/profile/PersonalInformation.tsx
"use client";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import StepFooter from "./StepFooter";
import {
  useGetStepQuery,
  useSaveStepMutation,
  useUploadSponsorProfilePictureMutation,
} from "../../../redux/services/scholar/api";
import useProfileStepNav from "./useProfileStepNav";
import { toast } from "sonner";
import { Camera, CircleX } from "lucide-react";
import { useDispatch } from "react-redux";
import {  Profile } from "../../../redux/slices/scholar/authSlice";

/* ---------------- Schema ---------------- */
const schema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(5, "Enter a valid phone number"),
  dateOfBirth: z.string().optional(), // yyyy-mm-dd
  gender: z.string().optional(),
  occupation: z.string().optional(),
});
type FormT = z.infer<typeof schema>;

type StepProps = { onPrev?: () => void; onNext?: () => void };

/* ---------------- Utils ---------------- */


const initials = (name?: string) => {
  if (!name) return "SP";
  const parts = name.trim().split(/\s+/);
  const a = parts[0]?.[0] ?? "";
  const b = parts[1]?.[0] ?? "";
  return (a + b || a).toUpperCase() || "SP";
};

/* ---------------- Component ---------------- */
export default function PersonalInformation({ onPrev, onNext }: StepProps) {
  const {
    data,
    refetch, 
  } = useGetStepQuery("personal", {
    refetchOnMountOrArgChange: true, // helpful when navigating back to this step
  });
  const dispatch = useDispatch();
  const [saveStep, { isLoading }] = useSaveStepMutation();
  const [uploadPic, { isLoading: uploading }] =
    useUploadSponsorProfilePictureMutation();

  const nav = useProfileStepNav();

  const form = useForm<FormT>({
    resolver: zodResolver(schema),
    defaultValues: {} as any,
  });

  // local image state
  const [serverUrl, setServerUrl] = React.useState<string | null>(null);
  const [pickedFile, setPickedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // hydrate fields + avatar from API response
  React.useEffect(() => {
    if (!data) return;

    // data structure: your controller should return personal fields + profilePicture
    form.reset({
      fullName: data?.fullName ?? "",
      email: data?.email ?? "",
      phone: data?.phone ?? "",
      dateOfBirth: data?.dateOfBirth?.slice(0, 10) ?? "",
      gender: data?.gender ?? "",
      occupation: data?.occupation ?? "",
    });

    const url =
      data?.profilePicture?.url ||
      data?.profilePicture?.uploadURL ||
      data?.avatar ||
      null;

    setServerUrl(url);
    setPreviewUrl(url);
    setPickedFile(null);
  }, [data]);

  // pick/remove handlers (local)
  const onPick = (file: File | null) => {
    setPickedFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(String(reader.result));
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(serverUrl);
    }
  };

  const onRemoveLocal = () => {
    // local-only removal; if you also want server deletion, add a remove mutation and call it here
    setPickedFile(null);
    setPreviewUrl(null);
    setServerUrl(null);
  };

  // submit & go next
  // util: split and title-case
  function splitName(fullName: string) {
    const clean = (fullName || "").trim().replace(/\s+/g, " ");
    if (!clean) return { firstName: "", lastName: "" };
    const parts = clean.split(" ");
    const first = toTitle(parts[0]);
    const last = toTitle(parts.slice(1).join(" "));
    return { firstName: first, lastName: last };
  }

  function toTitle(s: string) {
    return s
      .toLowerCase()
      .split(/([-' ])/)
      .map((seg) =>
        /[a-z]/.test(seg[0] || "") ? seg[0].toUpperCase() + seg.slice(1) : seg
      )
      .join("");
  }

  // submit & go next
  const submitAndNext = form.handleSubmit(async (values) => {
    try {
      if (pickedFile) {
        await uploadPic({ file: pickedFile }).unwrap();
        await refetch();
      }

      const res = await saveStep({
        stepKey: "personal",
        payload: values,
      }).unwrap();

      // Some backends return {data: {profile}} others {data: {response: {profile}}}
      const profile =
        res?.data?.profile ?? res?.data?.response?.profile ?? null;

      const fullName = profile?.personalInfo?.fullName ?? "";
      const { firstName, lastName } = splitName(fullName);
      const avatar = profile?.profilePicture?.url ?? "";

      dispatch(
        Profile({
          firstName,
          lastName,
          avatar,
        })
      );

      toast.success(res?.message ?? "Saved");
      await refetch();
      (onNext ?? nav.goNext)();
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Failed to save");
    }
  });

  // save only (stay on page)
  const saveOnly = form.handleSubmit(async (values) => {
    try {
      if (pickedFile) {
        await uploadPic({ file: pickedFile }).unwrap();
        await refetch(); // 👈 refresh cache right after upload
      }

      const res = await saveStep({
        stepKey: "personal",
        payload: values,
      }).unwrap();

      toast.success(res?.message ?? "Saved");
      await refetch(); // 👈 refresh cache after saving as well
    } catch (e: any) {
      toast.error(e?.data?.message ?? e?.message ?? "Failed to save");
    }
  });

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <form className="mx-auto max-w-3xl p-4">
      <h1 className="mb-3 text-xl font-semibold">Personal Information</h1>

      {/* Avatar row */}
      <div className="mb-6 flex flex-col items-center gap-4">
        {/* Avatar */}
        <div className="relative">
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile"
              className="size-20 rounded-full object-cover ring-1 ring-gray-200 dark:ring-gray-700"
            />
          ) : (
            <div className="size-20 rounded-full bg-indigo-600 text-white ring-1 ring-indigo-500/20 flex items-center justify-center text-lg font-semibold">
              {initials(form.getValues("fullName"))}
            </div>
          )}

          {previewUrl && (
            <button
              type="button"
              onClick={onRemoveLocal}
              disabled={isLoading || uploading}
              className="absolute -right-2 -top-2 rounded-full bg-white p-1 text-red-600 shadow ring-1 ring-gray-200 hover:bg-red-50 disabled:opacity-50"
              title="Remove"
            >
              <CircleX className="size-4" />
            </button>
          )}
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => onPick(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || uploading}
            className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <Camera className="size-4" />
            {previewUrl ? "Change photo" : "Upload photo"}
          </button>
          <p className="text-xs text-gray-500">
            PNG, JPG, WEBP · up to ~5&nbsp;MB
          </p>
        </div>
      </div>

      {/* Fields */}
      <div className="flex flex-col md:flex-row gap-x-4 w-full ">
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Full Name</label>
          <input
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("fullName")}
          />
        </div>
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Email</label>
          <input
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("email")}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-x-4 w-full ">
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Phone Number</label>
          <input
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("phone")}
          />
        </div>
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Date of Birth</label>
          <input
            type="date"
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("dateOfBirth")}
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-x-4 w-full ">
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Gender</label>
          <select
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("gender")}
          >
            <option value="">Select</option>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
        </div>
        <div className="flex flex-col md:w-1/2 w-full">
          <label className="mt-4 block text-sm">Occupation or profession</label>
          <input
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...form.register("occupation")}
          />
        </div>
      </div>

      <StepFooter
        prevDisabled={false /* or nav.isFirst if you prefer */}
        nextDisabled={isLoading || uploading}
        onPrev={onPrev ?? nav.goPrev}
        onNext={submitAndNext}
        onSaveLater={saveOnly}
      />
    </form>
  );
}
