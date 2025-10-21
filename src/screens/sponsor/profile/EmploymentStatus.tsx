"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import StepFooter from "./StepFooter";
import useProfileStepNav from "./useProfileStepNav";
import {
  useGetStepQuery,
  useSaveStepMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";

type StepProps = { onPrev?: () => void; onNext?: () => void };

type FormT = {
  category: string;
  employerName?: string;
  designation?: string;
};

const OPTIONS = [
  "Full-time Employment",
  "Par-time Employment",
  "Unemployed",
  "Others",
];

export default function EmploymentStatus({ onPrev, onNext }: StepProps) {
  const nav = useProfileStepNav();
  const { data } = useGetStepQuery("employment");
  const [saveStep, { isLoading }] = useSaveStepMutation();

  const { register, handleSubmit, watch, reset } = useForm<FormT>({
    defaultValues: { category: "Unemployed" },
  });

  React.useEffect(() => {
    if (data) {
      reset({
        category: data.category || "Unemployed",
        employerName: data.employerName || "",
        designation: data.designation || "",
      });
    }
  }, [data, reset]);

  const submitAndNext = handleSubmit(async (values) => {
    const res = await saveStep({
      stepKey: "employment",
      payload: values,
    }).unwrap();
    toast.success(res?.message);
    (onNext ?? nav.goNext)();
  });

  const saveOnly = handleSubmit(async (values) => {
    await saveStep({ stepKey: "employment", payload: values }).unwrap();
  });

  const cat = watch("category");

  return (
    <form className="mx-auto max-w-2xl p-4">
      <h1 className="mb-1 text-xl font-semibold">Employment Status</h1>
      <p className="text-sm text-gray-500">
        Kindly select a category to initiate.
      </p>

      <div className="mt-3 space-y-2">
        {OPTIONS.map((o) => (
          <label
            key={o}
            className={`flex items-center gap-3 rounded-md border p-3 ${
              cat === o ? "border-blue-500" : "border-gray-200"
            }`}
          >
            <input type="radio" value={o} {...register("category")} />
            {o}
          </label>
        ))}
      </div>

      {(cat === "Full-time Employment" ||
        cat === "Par-time Employment" ||
        cat === "Others") && (
        <div className="flex flex-col md:flex-row gap-x-4 w-full ">
          <div className="flex flex-col w-1/2">
            <label className="mt-4 block text-sm">Employer Name</label>
            <input
              className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
              {...register("employerName")}
            />
          </div>

          <div className="flex flex-col w-1/2">
            <label className="mt-4 block text-sm">Designation</label>
            <input
              className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
              {...register("designation")}
            />
          </div>
        </div>
      )}

      <StepFooter
        prevDisabled={nav.isFirst}
        nextDisabled={isLoading}
        onPrev={onPrev ?? nav.goPrev}
        onNext={submitAndNext}
        onSaveLater={saveOnly}
      />
    </form>
  );
}
