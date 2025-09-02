import { BrowserRouter, Route, Routes } from "react-router";
import AfroScholarsLanding from "./screens/landing-page/AfroScholarLanding";
import ScholarSignup from "./screens/auth/scholar/Signup";
import ScholarLogin from "./screens/auth/scholar/Login";
import { Toaster } from "sonner";
import ScholarDashboard from "./screens/auth/scholar/Dashboard";
import ResetPassword from "./screens/auth/scholar/ResetPassword";
import AccountSetup from "./screens/auth/scholar/accountSetup/AccountSetup";
import AccountSetupWizardRHF from "./screens/auth/scholar/accountSetup/AccountSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AfroScholarsLanding />} />
        <Route path="/auth/scholar/signup" element={<ScholarSignup />} />
        <Route path="/auth/scholar/login" element={<ScholarLogin />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/scholar/dashboard" element={<ScholarDashboard />} />
        <Route
          path="/scholar/account-setup"
          element={<AccountSetupWizardRHF />}
        />
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
