import { BrowserRouter, Route, Routes } from "react-router";
import AfroScholarsLanding from "./screens/landing-page/AfroScholarLanding";
import ScholarSignup from "./screens/auth/scholar/Signup";
import ScholarLogin from "./screens/auth/scholar/Login";
import { Toaster } from "sonner";
import ScholarDashboard from "./screens/auth/scholar/Dashboard";
import ResetPassword from "./screens/auth/scholar/ResetPassword";
import AccountSetupWizardRHF from "./screens/auth/scholar/accountSetup/AccountSetup";
import ProfileWizard from "./screens/auth/scholar/profile/Layout";
import ScholarDashboardLayout from "./screens/auth/scholar/DashboardLayout";

import withAuth from "./hoc/withAuth";
import SponsorSignup from "./screens/sponsor/auth/Signup";
import SponsorLogin from "./screens/sponsor/auth/Login";
import CreateScholarshipWizard from "./screens/sponsor/scholarship/CreateScholarshipWizard";
import PaymentReturn from "./screens/payment/PaymentReturn";
import ResetsPassword from "./screens/sponsor/auth/ResetsPassword";
import FundingCallback from "./screens/sponsor/scholarship/FundingCallback";
import SponsorDashboardLayout from "./screens/sponsor/SponsorDashboardLayout";
import { ScholarshipsTab } from "./screens/sponsor/ScholarshipsTab";
import { TransactionsTab } from "./screens/sponsor/TransactionsTab";

function App() {
  const ProtectedScholarDashboardLayout = withAuth(ScholarDashboardLayout);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AfroScholarsLanding />} />
        <Route path="/auth/scholar/signup" element={<ScholarSignup />} />
        <Route path="/auth/scholar/login" element={<ScholarLogin />} />

        <Route path="/auth/sponsor/signup" element={<SponsorSignup />} />
        <Route path="/auth/sponsor/login" element={<SponsorLogin />} />

        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/resets-password" element={<ResetsPassword />} />

        {/* <Route
          path="/scholar/account-setup"
          element={<AccountSetupWizardRHF />}
        /> */}
        <Route path="/scholar" element={<ProtectedScholarDashboardLayout />}>
          <Route path="dashboard" index element={<ScholarDashboard />} />
          <Route path="profile" element={<ProfileWizard />} />
          <Route path="account-setup" element={<AccountSetupWizardRHF />} />
        </Route>

        <Route
          path="/sponsor/scholarships/create"
          element={<CreateScholarshipWizard />}
        />
        <Route
          path="/sponsor/scholarships/:id/edit"
          element={<CreateScholarshipWizard />}
        />
        <Route
          path="/sponsor/scholarships/:id/funding/callback"
          element={<FundingCallback />}
        />
        <Route
          path="/sponsors/api/payment/wallet/callback"
          element={<PaymentReturn />}
        />

        <Route path="/sponsor/dashboard" element={<SponsorDashboardLayout />}>
          <Route index element={<ScholarshipsTab />} />
          <Route path="transactions" element={<TransactionsTab />} />
        </Route>
      </Routes>
      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
