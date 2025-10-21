type StepFooterProps = {
  onPrev?: () => void;
  onNext?: () => void;
  onSaveLater?: () => void;
  nextDisabled?: boolean;
  prevDisabled?: boolean; // <-- make sure this exists
  step?: number;
};

export default function StepFooter({
  onPrev,
  onNext,
  onSaveLater,
  nextDisabled,
  prevDisabled, // <-- and it’s spelled this way here
  step,
}: StepFooterProps) {
  console.log(step);
  return (
    <div className="sticky bottom-0 z-10 mt-8 space-y-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={prevDisabled} // <-- used here
          onClick={onPrev}
          className="flex-1 rounded-md bg-blue-600 px-4 py-3 text-white shadow hover:bg-blue-700 disabled:opacity-60"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={nextDisabled}
          onClick={onNext}
          className="flex-1 rounded-md bg-blue-100 px-4 py-3 text-blue-700 shadow hover:bg-blue-200 disabled:opacity-60"
        >
          {step === 7 ? "Submit" : "Next"}
        </button>
      </div>
      <button
        type="button"
        onClick={onSaveLater}
        className="w-full rounded-md border border-blue-600 px-4 py-3 text-blue-700 hover:bg-blue-50"
      >
        Save and Continue Later
      </button>
    </div>
  );
}
