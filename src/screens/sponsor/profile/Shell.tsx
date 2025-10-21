import { Outlet } from "react-router";

// src/modules/sponsor/profile/Shell.tsx
export default function ProfileWizardShell() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-4">
      <Outlet />
    </div>
  );
}
