import ActivityRHF from "./form-steps/Activity";
import AdditionalInfoRHF from "./form-steps/AdditionalInfo";
import AddressStepForm from "./form-steps/AddressInfo";
import CommunityBasedOrgRHF from "./form-steps/CommunityBasedOrg";
import ContactDetailsRHF from "./form-steps/ContactDetails";
import DemographicsRHF from "./form-steps/Demographics";
import EducationRHF from "./form-steps/Education";
import FinancialAnalysisRHF from "./form-steps/FinancialAnalysis";
import FuturePlansRHF from "./form-steps/FuturePlans";
import GeographyNationalityRHF from "./form-steps/Geography";
import HouseholdRHF from "./form-steps/HouseHold";
import LanguageRHF from "./form-steps/Language";
import LeadershipTrackRecordRHF from "./form-steps/LeadershipTrackRecord";
import ParentRHF from "./form-steps/Parents";
import PersonalStepForm from "./form-steps/PersonalInfo";
import ResultsCertificationsRHF from "./form-steps/Results";
import SiblingsRHF from "./form-steps/Siblings";
import SSCEExamsRHF from "./form-steps/SSCE";
import type { StepKey } from "./Layout";

const StepRenderer: React.FC<{
  step: StepKey;
  initialData: any;
  onPrev: (values?: any) => void;
  onNext: (values?: any) => void;
  onSave: (values: any) => Promise<void>;
  isSaving: boolean;
}> = ({ step, ...rest }) => {
  switch (step) {
    case "personal":
      return <PersonalStepForm {...rest} />;
    case "address":
      return <AddressStepForm {...rest} />;
    case "contact":
      return <ContactDetailsRHF {...rest} />;
    case "demographics":
      return <DemographicsRHF {...rest} />;
    case "language":
      return <LanguageRHF {...rest} />;
    case "geo":
      return <GeographyNationalityRHF {...rest} />;
    case "household":
      return <HouseholdRHF {...rest} />;
    case "parent":
      return <ParentRHF {...rest} />;
    case "siblings":
      return <SiblingsRHF {...rest} />;
    case "education":
      return <EducationRHF {...rest} />;
    case "financial":
      return <FinancialAnalysisRHF {...rest} />;
    case "cbo":
      return <CommunityBasedOrgRHF {...rest} />;
    case "leadership":
      return <LeadershipTrackRecordRHF {...rest} />;
    case "future":
      return <FuturePlansRHF {...rest} />;
    case "activity":
      return <ActivityRHF {...rest} />;
    case "additional":
      return <AdditionalInfoRHF {...rest} />;
    case "ssce":
      return <SSCEExamsRHF {...rest} />;
    case "result":
      return <ResultsCertificationsRHF {...rest} />;
    default:
      return <div className="p-6">Form for “{step}” not implemented yet.</div>;
  }
};

export default StepRenderer;
