import { Outlet } from "react-router";
import Header from "./Header";

const ScholarDashboardLayout = () => {
  return (
    <div className="max-w-screen-2xl mx-auto">
      <Header />
      <div className="mt-16">
        <Outlet />
      </div>
      
    </div>
  );
};

export default ScholarDashboardLayout;
