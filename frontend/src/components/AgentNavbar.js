import React, { useEffect, useState} from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import socket from "../socket/socketClient";
import { apiClient } from "../apiclient/apiclient";



const AgentNavbar = () => {
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
 

  /* ================= LOAD COMPANY ================= */
  useEffect(() => {
    const loadCompany = async () => {
      try {
        const res = await apiClient.get("/settings/company");
        setCompany(res.data);
      } catch (err) {
        console.error("Failed to load company");
      }
    };
    loadCompany();
  }, []);


  // useEffect(() => {
  //   const today = new Date().toDateString();
  //   const lastVisit = localStorage.getItem("agentDashboardLastVisit");

  //   if (lastVisit !== today) {
  //     setGreeting(getGreeting());
  //     localStorage.setItem("agentDashboardLastVisit", today);
  //   } else {
  //     setGreeting("Welcome back");
  //   }
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (socket?.connected) {
      socket.disconnect();
    }

    navigate("/");
  };
  

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-blue-900 border-b border-blue-800 z-50">
      <div className="h-full flex items-center justify-between px-4 md:px-6">

        {/* LEFT: LOGO + COMPANY */}
        <div className="flex items-center gap-3">
          <img
            src={
              company?.logo
                ? `${process.env.REACT_APP_IMAGE_URL}/${company.logo}`
                : `${process.env.PUBLIC_URL}/logo192.png`
            }
            alt="Company Logo"
            className="h-10 w-10 object-contain rounded-md bg-white p-1"
          />

          
            <div className="text-white font-semibold text-lg">
              {company?.companyName || "Company"}
            
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">
          <NotificationBell />

          <button
            onClick={handleLogout}
            className="text-red-300 hover:text-red-400 transition"
            title="Logout"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

      </div>
    </header>
  );
};

export default AgentNavbar;
