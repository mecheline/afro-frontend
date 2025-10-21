"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import StepFooter from "./StepFooter";
import useProfileStepNav from "./useProfileStepNav";
import {
  useGetCountriesQuery,
  useGetStepQuery,
  useSaveStepMutation,
} from "../../../redux/services/scholar/api";
import { toast } from "sonner";

type StepProps = { onPrev?: () => void; onNext?: () => void };

export default function CountryOfResidence({ onPrev, onNext }: StepProps) {
  const nav = useProfileStepNav();
  const { data: step } = useGetStepQuery("residence");
  const [q, setQ] = React.useState("");
  const { data: countries = [], isFetching } = useGetCountriesQuery(q);
  const [saveStep, { isLoading }] = useSaveStepMutation();

  const { register, watch, setValue, handleSubmit, reset } = useForm<{
    countryOfResidence: string;
  }>({ defaultValues: { countryOfResidence: "" } });

  React.useEffect(() => {
    if (step?.countryOfResidence) {
      reset({ countryOfResidence: step.countryOfResidence });
    }
  }, [step, reset]);

  const submitAndNext = handleSubmit(async (v) => {
    const res = await saveStep({ stepKey: "residence", payload: v }).unwrap();
    toast.success(res?.message);
    (onNext ?? nav.goNext)();
  });

  const saveOnly = handleSubmit(async (v) => {
    await saveStep({ stepKey: "residence", payload: v }).unwrap();
  });

  const selected = watch("countryOfResidence");

  return (
    <form className="mx-auto max-w-3xl p-4">
      <h1 className="mb-2 text-xl font-semibold">Country of Residence</h1>

      <div className="mt-3">
        <input
          placeholder="Search country"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="textInput w-full rounded-md border p-3"
        />
      </div>

      <div className="mt-3 max-h-80 space-y-2 overflow-y-auto pr-1">
        {countries.map((c) => (
          <label
            key={c.code}
            className="flex items-center gap-2 rounded-md p-2 hover:bg-gray-50"
          >
            <input
              type="radio"
              name="countryPick"
              checked={selected === c.name}
              onChange={() => setValue("countryOfResidence", c.name)}
            />
            {c.name}
          </label>
        ))}
        {!isFetching && countries.length === 0 && (
          <div className="text-sm text-gray-500">No matches.</div>
        )}
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
