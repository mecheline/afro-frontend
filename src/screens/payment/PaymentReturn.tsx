import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useLazyVerifyScholarshipFundingQuery } from "../../redux/services/scholar/api";

const PaymentReturn: React.FC = () => {
  const navigate = useNavigate();
  const { search } = useLocation();
  const reference = new URLSearchParams(search).get("reference") || "";
  console.log(reference);
  const [verify, { isFetching }] = useLazyVerifyScholarshipFundingQuery();

  useEffect(() => {
    (async () => {
      if (!reference) return;
      try {
        const res = await verify({ reference }).unwrap();
        console.log(res);
        navigate(
          //`/sponsor/scholarships/create?step=${res.nextStep}&id=${res.scholarshipId}`,
          `/sponsor/scholarships/create?step=3&id=${res.scholarshipId}`,
          { replace: true }
        );
      } catch (e) {
        const fallback = JSON.parse(
          localStorage.getItem("postPaystackContinue") || "{}"
        );
        navigate(
          `/sponsor/scholarships/create?step=2&id=${
            fallback.scholarshipId || ""
          }`
        );
      } finally {
        localStorage.removeItem("postPaystackContinue");
      }
    })();
  }, [reference]);

  return (
    <div className="max-w-screen-sm mx-auto p-8 text-center">
      <div className="text-2xl font-semibold mb-2">Verifying payment…</div>
      <p className="text-gray-600">
        Please hold while we confirm your transaction.
      </p>
      {isFetching && (
        <div className="mt-6 animate-pulse h-2 bg-gray-200 rounded-full" />
      )}
    </div>
  );
};

export default PaymentReturn;
