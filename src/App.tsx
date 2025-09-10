import { BrowserRouter, Route, Routes } from "react-router";
import AfroScholarsLanding from "./screens/landing-page/AfroScholarLanding";
import ScholarSignup from "./screens/auth/scholar/Signup";
import ScholarLogin from "./screens/auth/scholar/Login";
import { Toaster } from "sonner";
import ScholarDashboard from "./screens/auth/scholar/Dashboard";
import ResetPassword from "./screens/auth/scholar/ResetPassword";
import AccountSetupWizardRHF from "./screens/auth/scholar/accountSetup/AccountSetup";
import ProfileLayout from "./screens/auth/scholar/profile/Layout";
import DashboardLayout from "./screens/auth/scholar/DashboardLayout";
import ProfileWizard from "./screens/auth/scholar/profile/Layout";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AfroScholarsLanding />} />
        <Route path="/auth/scholar/signup" element={<ScholarSignup />} />
        <Route path="/auth/scholar/login" element={<ScholarLogin />} />

        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/scholar/account-setup"
          element={<AccountSetupWizardRHF />}
        />
        <Route path="/scholar" element={<DashboardLayout />}>
          <Route path="dashboard" index element={<ScholarDashboard />} />
          <Route path="profile" element={<ProfileWizard />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
