import { BrowserRouter, Navigate, Route, Routes } from "react-router"; // <-- dom
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
import Scholarship from "./screens/auth/scholar/scholarships/Scholarship";
import ScholarshipDetail from "./screens/auth/scholar/scholarships/ScholarshipDetails";
import ApplicationsPage from "./screens/auth/scholar/applications/Applications";
import ApplicationDetailsPage from "./screens/auth/scholar/applications/ApplicatioDetails";
import SettingsPage from "./screens/auth/scholar/settings/Settings";
import SponsorSettingsPage from "./screens/sponsor/settings/Settings";
import ProfileWizardShell from "./screens/sponsor/profile/Shell";
import PersonalInformation from "./screens/sponsor/profile/PersonalInformation";
import CountryOfResidence from "./screens/sponsor/profile/CountryOfResidence";
import EmploymentStatus from "./screens/sponsor/profile/EmploymentStatus";
import SocialMedia from "./screens/sponsor/profile/SocialMedia";
import Hobbies from "./screens/sponsor/profile/Hobbies";
import Anniversaries from "./screens/sponsor/profile/Anniversaries";
import VerificationDocument from "./screens/sponsor/profile/VerificationDocument";
import MatchedScholars from "./screens/sponsor/MatchedScholars";
import Applications from "./screens/sponsor/Applications";
import ApplicationDetail from "./screens/sponsor/ApplicationDetail";

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
        <Route
          path="/scholar/account-setup"
          element={<AccountSetupWizardRHF />}
        />
        {/* SCHOLAR DASHBOARD SHELL (Header + Sidebar) */}
        <Route path="/scholar" element={<ProtectedScholarDashboardLayout />}>
          {/* dashboard home */}
          <Route path="dashboard" element={<ScholarDashboard />} />

          {/* profile steps INSIDE the layout so Header/Sidebar show */}
          <Route path="dashboard/profile">
            <Route
              index
              element={
                <Navigate to="/scholar/dashboard/profile/personal" replace />
              }
            />
            <Route path=":step" element={<ProfileWizard />} />
          </Route>
          <Route path="dashboard/scholarships" element={<Scholarship />} />
          <Route
            path="dashboard/scholarships/:id"
            element={<ScholarshipDetail />}
          />

          <Route path="dashboard/applications" element={<ApplicationsPage />} />
          <Route
            path="dashboard/applications/:appId"
            element={<ApplicationDetailsPage />}
          />
          <Route path="dashboard/settings" element={<SettingsPage />} />

          {/* other pages in the same shell */}
        </Route>

        {/* SPONSOR SIDE */}
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
        <Route path="/redirect" element={<FundingCallback />} />
        <Route
          path="/sponsors/api/payment/wallet/callback"
          element={<PaymentReturn />}
        />

        <Route path="/sponsor/dashboard" element={<SponsorDashboardLayout />}>
          <Route index element={<ScholarshipsTab />} />
          <Route path="matched-scholars/:id" element={<MatchedScholars />} />
          <Route path="applications/:id" element={<Applications />} />
          <Route
            path="applications/:id/application/:appId"
            element={<ApplicationDetail />}
          />
          <Route path="transactions" element={<TransactionsTab />} />
          <Route path="settings" element={<SponsorSettingsPage />} />
          <Route
            path="/sponsor/dashboard/profile"
            element={<ProfileWizardShell />}
          >
            {/* default to personal */}
            <Route index element={<Navigate to="personal" replace />} />
            <Route path="personal" element={<PersonalInformation />} />
            <Route path="residence" element={<CountryOfResidence />} />
            <Route path="employment" element={<EmploymentStatus />} />
            <Route path="social" element={<SocialMedia />} />
            <Route path="hobbies" element={<Hobbies />} />
            <Route path="anniversaries" element={<Anniversaries />} />
            <Route
              path="verification"
              element={<VerificationDocument step={7} />}
            />
          </Route>
        </Route>
      </Routes>

      <Toaster position="top-center" richColors />
    </BrowserRouter>
  );
}

export default App;
