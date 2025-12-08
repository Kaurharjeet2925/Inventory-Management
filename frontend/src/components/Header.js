import React, { useContext } from "react";
import { UserCircle } from "lucide-react";
import { NotificationContext } from "../context/NotificationContext";
import NotificationDropdown from "./NotificationDropdown";

const Header = () => {
  const { notifications } = useContext(NotificationContext);

  return (
    <div className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white shadow flex items-center justify-end px-6 z-50">

      
      <NotificationDropdown notifications={notifications} />

      {/* Profile Icon */}
      <div className="ml-4">
        <UserCircle size={28} />
      </div>
    </div>
  );
};

export default Header;
