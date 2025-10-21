// src/features/scholarships/FundingCallback.tsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useLazyVerifyFundingQuery } from "../../../redux/services/scholar/api";

const FundingCallback: React.FC = () => {
  //const { id } = useParams<{ id: string }>();
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const [triggerVerify] = useLazyVerifyFundingQuery();

  useEffect(() => {
    (async () => {
      //if (!id) return;
      const reference = sp.get("reference") || sp.get("trxref");
      console.log(reference, "REFERENCE");
      if (reference) {
        try {
          const r = await triggerVerify({ reference }).unwrap();
          console.log(r);
          // carry status to edit screen for UX (optional)
          navigate(
            `/sponsor/scholarships/${r?.scholarship?._id}/edit?status=${r.status}`,
            {
              replace: true,
            }
          );
          return;
        } catch {
          // fallback if verify fails (network)
        }
      }
      // no reference? just go to edit and let Step 2 "Continue" refetch

      //navigate(`/sponsor/scholarships/${id}/edit`, { replace: true });
      navigate(`/sponsor/dashboard`, { replace: true });
    })();
  }, [sp, triggerVerify, navigate]);

  return (
    <div className="flex items-center justify-center mt-16 text-green-500">
      Finalizing payment…
    </div>
  );
};

export default FundingCallback;
