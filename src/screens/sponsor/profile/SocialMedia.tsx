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
  facebook?: string;
  instagram?: string;
  twitter?: string;
  website?: string;
};

export default function SocialMedia({ onPrev, onNext }: StepProps) {
  const nav = useProfileStepNav();
  const { data } = useGetStepQuery("social");
  const [saveStep, { isLoading }] = useSaveStepMutation();
  const { register, handleSubmit, reset } = useForm<FormT>({
    defaultValues: {},
  });

  React.useEffect(() => {
    if (data) reset(data);
  }, [data, reset]);

  const submitAndNext = handleSubmit(async (values) => {
    const res = await saveStep({ stepKey: "social", payload: values }).unwrap();
    toast.success(res?.message);
    (onNext ?? nav.goNext)();
  });

  const saveOnly = handleSubmit(async (values) => {
    await saveStep({ stepKey: "social", payload: values }).unwrap();
  });

  return (
    <form className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-semibold">Social Media</h1>
      <div className="flex flex-wrap space-x-2 w-full">
        {["facebook", "instagram", "twitter", "website"].map((k) => (
          <div key={k} className="mt-4 w-[48%]">
            <div className="">
              <label className="block text-sm capitalize">{k}</label>
              <input
                className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
                {...register(k as keyof FormT)}
              />
            </div>
          </div>
        ))}
      </div>

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
