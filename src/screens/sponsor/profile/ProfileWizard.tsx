// src/modules/sponsor/profile/ProfileWizard.tsx
import * as React from "react";
import PersonalInformation from "./PersonalInformation";
import CountryOfResidence from "./CountryOfResidence";
import EmploymentStatus from "./EmploymentStatus";
import SocialMedia from "./SocialMedia";
import Hobbies from "./Hobbies";
import Anniversaries from "./Anniversaries";
import VerificationDocument from "./VerificationDocument";

export default function ProfileWizard() {
  const [step, setStep] = React.useState(1);
  const back = () => setStep((s) => Math.max(1, s - 1));
  const next = () => setStep((s) => Math.min(7, s + 1));

  console.log(step);

  return (
    <div className="mx-auto w-full max-w-3xl">
      {step === 1 && <PersonalInformation onPrev={back} onNext={next} />}
      {step === 2 && <CountryOfResidence onPrev={back} onNext={next} />}
      {step === 3 && <EmploymentStatus onPrev={back} onNext={next} />}
      {step === 4 && <SocialMedia onPrev={back} onNext={next} />}
      {step === 5 && <Hobbies onPrev={back} onNext={next} />}
      {step === 6 && <Anniversaries onPrev={back} onNext={next} />}
      {step === 7 && (
        <VerificationDocument onPrev={back} onNext={() => {}} step={step} />
      )}
    </div>
  );
}
