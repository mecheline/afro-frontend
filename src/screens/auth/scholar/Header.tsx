import { useSelector } from "react-redux";
import type { RootState } from "../../../redux/services/scholar/store";
import { Link } from "react-router";
import { Bell } from "lucide-react";

const Header = () => {
  const user = useSelector((state: RootState) => state.auth);
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto w-full px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatar ?? undefined}
              className="h-9 w-9 rounded-full object-cover"
              alt="avatar"
            />
            <div>
              <p className="text-xs text-slate-500">Good Morning 👋</p>
              <p className="text-sm font-semibold text-slate-900">
                {user?.lastName} {user?.firstName}
              </p>
            </div>
          </div>
          {/* <Link to={"/scholar/profile"}>Profile</Link> */}
          <button className="relative rounded-xl p-2 text-slate-600 hover:bg-slate-100">
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 block h-2.5 w-2.5 rounded-full bg-red-500" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
