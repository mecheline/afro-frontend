import { Avatar } from "antd";
import { Banknote, LayoutDashboard, Settings, User, X } from "lucide-react";
import { Link, useLocation } from "react-router";

const SidebarItems = [
  {
    label: "Scholarship",
    url: "/sponsor/dashboard",
    icon: <LayoutDashboard />,
  },
  {
    label: "Transactions",
    url: "/sponsor/dashboard/transactions",
    icon: <Banknote />,
  },
  {
    label: "Profile",
    url: "/sponsor/profile",
    icon: <User />,
  },
  {
    label: "Settings",
    url: "/sponsor/settings",
    icon: <Settings />,
  },
];

type SidebarProps = {
  onItemClick?: () => void;
  onClose?: () => void;
};

const Sidebar = ({ onItemClick, onClose }: SidebarProps) => {
  const location = useLocation();
  return (
    <div className="bg-[#1C2434] flex flex-col h-full overflow-y-auto relative">
      {/* Close icon for mobile */}
      <div className="flex justify-end p-4 lg:hidden">
        <button onClick={onClose} aria-label="Close Sidebar">
          <X className="w-6 h-6 text-white" />
        </button>
      </div>
      {SidebarItems.map((item) => {
        const isActive = location.pathname === item.url;
        return (
          <div className="flex space-x-2 w-full">
            {isActive && <div className="bg-[#EBC31E] w-1 h-12"></div>}
            {!isActive && <div className="w-1 h-12"></div>}
            <Link
              to={item.url}
              onClick={onItemClick}
              className={`flex items-center gap-2 px-4 py-2  w-full ${
                isActive
                  ? "bg-[#EBC31E] text-white"
                  : "text-[#B2B2B2] hover:bg-[#343F54]"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          </div>
        );
      })}
      <div className="md:hidden mt-auto px-4 mb-4">
        <div className="flex md:hidden items-center gap-2">
          <Avatar size={64} icon={<User />} />
          <span className="text-white">Uche Amaechi</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
