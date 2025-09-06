// ProfileLayout.tsx
import { useState } from "react";
import {
  Contact,
  Languages,
  MapPinHouse,
  UserRound,
  Users,
} from "lucide-react";
import Sidebar from "./Sidebar";
import Form from "./Form";

export type SectionKey =
  | "personal"
  | "address"
  | "contact"
  | "demographics"
  | "language"
  | "geo"
  | "household"
  | "parent"
  | "siblings"
  | "education"
  | "financial"
  | "cbo"
  | "leadership"
  | "future"
  | "testing"
  | "activity"
  | "additional"
  | "result"
  | "ssce";

export type SidebarItem = {
  key: SectionKey;
  name: string;
  icon: React.ReactNode;
};

const items: SidebarItem[] = [
  { key: "personal", name: "Personal Info", icon: <UserRound /> },
  { key: "address", name: "Address", icon: <MapPinHouse /> },
  { key: "contact", name: "Contact Details", icon: <Contact /> },
  { key: "demographics", name: "Demographics", icon: <Users /> },
  { key: "language", name: "Language", icon: <Languages /> },
  { key: "geo", name: "Geography and nationality", icon: <Languages /> },
  { key: "household", name: "Household", icon: <Languages /> },
  { key: "parent", name: "Parent", icon: <Languages /> },
  { key: "siblings", name: "Siblings", icon: <Languages /> },
  { key: "education", name: "Education", icon: <Languages /> },
  { key: "financial", name: "Financial Analysis", icon: <Languages /> },
  { key: "cbo", name: "Community Based Org.", icon: <Languages /> },
  { key: "leadership", name: "Leadership Track Record", icon: <Languages /> },
  { key: "future", name: "Future Plans", icon: <Languages /> },
  { key: "testing", name: "Testing / Examination", icon: <Languages /> },
  { key: "activity", name: "Activity", icon: <Languages /> },
  { key: "additional", name: "Additional Info", icon: <Languages /> },
  { key: "result", name: "Result", icon: <Languages /> },
  { key: "ssce", name: "SSCE Examinations", icon: <Languages /> },
];

export default function ProfileLayout() {
  const [active, setActive] = useState<SectionKey>("personal");

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="bg-[#3062C8] overflow-y-auto overscroll-contain">
        <Sidebar items={items} active={active} onSelect={setActive} />
      </aside>

      <main className=" flex-1 overflow-scroll">
        <Form section={active} />
      </main>
    </div>
  );
}
