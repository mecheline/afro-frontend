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

type FormT = { hobbies: { value: string }[] };

export default function Hobbies({ onPrev, onNext }: StepProps) {
  const nav = useProfileStepNav();
  const { data } = useGetStepQuery("hobbies");
  const [saveStep, { isLoading }] = useSaveStepMutation();

  const { control, register, handleSubmit, reset } = useForm<FormT>({
    defaultValues: { hobbies: [{ value: "" }] },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "hobbies",
  });

  React.useEffect(() => {
    if (Array.isArray(data?.hobbies)) {
      reset({
        hobbies:
          data.hobbies.length > 0
            ? data.hobbies.map((h: string) => ({ value: h }))
            : [{ value: "" }],
      });
    }
  }, [data, reset]);

  const submitAndNext = handleSubmit(async (v) => {
    const hobbies = v.hobbies.map((h) => h.value).filter(Boolean);
    const res = await saveStep({
      stepKey: "hobbies",
      payload: { hobbies },
    }).unwrap();
    toast.success(res?.message);
    (onNext ?? nav.goNext)();
  });

  const saveOnly = handleSubmit(async (v) => {
    const hobbies = v.hobbies.map((h) => h.value).filter(Boolean);
    await saveStep({ stepKey: "hobbies", payload: { hobbies } }).unwrap();
  });

  return (
    <form className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-semibold">Hobbies</h1>

      {fields.map((f, i) => (
        <div key={f.id} className="mt-3">
          <label className="block text-sm">Hobby</label>
          <input
            className="textInput mt-1 w-full rounded-md bg-gray-50 p-3"
            {...register(`hobbies.${i}.value` as const)}
          />
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
        onClick={() => append({ value: "" })}
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
