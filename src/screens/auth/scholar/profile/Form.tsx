// Form.tsx
import PersonalInfoRHF from "./form-steps/PersonalInfo";
import type { SectionKey } from "./Layout";

// import your step components

const AddressForm = () => <div className="p-6">Address form…</div>;
const ContactForm = () => <div className="p-6">Contact form…</div>;
// ...create stubs for the rest

const registry: Record<SectionKey, React.FC> = {
  personal: PersonalInfoRHF,
  address: AddressForm,
  contact: ContactForm,
  demographics: () => <div className="p-6">Demographics…</div>,
  language: () => <div className="p-6">Language…</div>,
  geo: () => <div className="p-6">Geography & nationality…</div>,
  household: () => <div className="p-6">Household…</div>,
  parent: () => <div className="p-6">Parent…</div>,
  siblings: () => <div className="p-6">Siblings…</div>,
  education: () => <div className="p-6">Education…</div>,
  financial: () => <div className="p-6">Financial Analysis…</div>,
  cbo: () => <div className="p-6">Community Based Org…</div>,
  leadership: () => <div className="p-6">Leadership Track Record…</div>,
  future: () => <div className="p-6">Future Plans…</div>,
  testing: () => <div className="p-6">Testing / Examination…</div>,
  activity: () => <div className="p-6">Activity…</div>,
  additional: () => <div className="p-6">Additional Info…</div>,
  result: () => <div className="p-6">Result…</div>,
  ssce: () => <div className="p-6">SSCE Examinations…</div>,
};

export default function Form({ section }: { section: SectionKey }) {
  const View =
    registry[section] ?? (() => <div className="p-6">Not found</div>);
  return <View />;
}
