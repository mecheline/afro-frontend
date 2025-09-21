import { Avatar } from "antd";
import logo from "../../assets/logo.png";
import { User } from "lucide-react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/services/scholar/store";

const Header = () => {
  const user = useSelector((state: RootState) => state.auth);
  return (
    <div className="md:w-full">
      <div className="flex items-center justify-between">
        <div>
          <img src={logo} alt="logo" />
        </div>
        <div className="hidden md:flex items-center space-x-2">
          <div className="flex flex-col">
            <span>
              {user.lastName} {user.firstName}
            </span>
            <span className="mt-[2px] border-gray-100 rounded-full px-1 bg-gray-50 text-gray-400">{user.role} Sponsor</span>
          </div>

          <Avatar size={64} icon={<User />} />
        </div>
      </div>
    </div>
  );
};

export default Header;
