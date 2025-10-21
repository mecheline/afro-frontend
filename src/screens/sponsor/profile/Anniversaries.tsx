"use client";

import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
import StepFooter from "./StepFooter";
import useProfileStepNav from "./useProfileStepNav";
import {
  useGetStepQuery,
  useSaveStepMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";

type StepProps = { onPrev?: () => void; onNext?: () => void };

type Row = { name: string; date: string };
type FormT = { anniversaries: Row[] };

export default function Anniversaries({ onPrev, onNext }: StepProps) {
  const nav = useProfileStepNav();
  const { data } = useGetStepQuery("anniversaries");
  const [saveStep, { isLoading }] = useSaveStepMutation();

  const { control, register, handleSubmit, reset } = useForm<FormT>({
    defaultValues: { anniversaries: [{ name: "", date: "" }] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "anniversaries",
  });

  React.useEffect(() => {
    if (Array.isArray(data?.anniversaries)) {
      reset({
        anniversaries:
          data.anniversaries.length > 0
            ? data.anniversaries.map((a: any) => ({
                name: a.name || "",
                date: a.date?.slice(0, 10) || "",
              }))
            : [{ name: "", date: "" }],
      });
    }
  }, [data, reset]);

  const submitAndNext = handleSubmit(async (v) => {
    const res = await saveStep({
      stepKey: "anniversaries",
      payload: v,
    }).unwrap();
    toast.success(res?.message);
    (onNext ?? nav.goNext)();
  });

  const saveOnly = handleSubmit(async (v) => {
    await saveStep({ stepKey: "anniversaries", payload: v }).unwrap();
  });

  return (
    <form className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-semibold">Anniversaries</h1>

      {fields.map((f, i) => (
        <div key={f.id} className="mt-4">
          <div className="text-sm text-gray-600">Anniversary {i + 1}</div>
          <div className="flex space-x-2">
            <input
              placeholder="Enter Anniversary Name (e.g. Wedding)"
              className="textInput mt-2 w-full rounded-md bg-gray-50 p-3"
              {...register(`anniversaries.${i}.name` as const)}
            />
            <input
              type="date"
              className="textInput mt-2 w-full rounded-md bg-gray-50 p-3"
              {...register(`anniversaries.${i}.date` as const)}
            />
          </div>

          {i > 0 && (
            <button
              type="button"
              onClick={() => remove(i)}
              className="mt-1 text-sm text-red-600"
            >
              Remove
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => append({ name: "", date: "" })}
        className="mt-4 text-blue-600"
      >
        + Add another
      </button>

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
