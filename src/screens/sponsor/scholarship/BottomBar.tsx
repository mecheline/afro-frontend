// components/BottomBar.tsx
type Props = {
  onBack: () => void;
  onMiddle?: () => void;
  onRight?: () => void;
  backLabel?: string;
  middleLabel?: string;
  rightLabel?: string;
  showMiddle?: boolean; // default true
  showRight?: boolean; // default true
  disableRight?: boolean;
};

const BottomBar: React.FC<Props> = ({
  onBack,
  onMiddle,
  onRight,
  backLabel = "Back",
  middleLabel = "Update",
  rightLabel = "Next",
  showMiddle = true,
  showRight = true,
  disableRight,
}) => (
  <div className="mt-8 bg-white/90 backdrop-blur">
    <div className="mx-auto flex max-w-4xl gap-3 px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="w-1/3 rounded-md border px-4 py-2"
      >
        {backLabel}
      </button>
      {showMiddle && (
        <button
          type="button"
          onClick={onMiddle}
          className="w-1/3 rounded-md border px-4 py-2"
        >
          {middleLabel}
        </button>
      )}
      {showRight && (
        <button
          type="button"
          onClick={onRight}
          disabled={disableRight}
          className="w-1/3 rounded-md bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rightLabel}
        </button>
      )}
    </div>
  </div>
);

export default BottomBar;
