import { Bell, LogOut } from "lucide-react";

const AgentNavbar = () => {
  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-50 flex justify-between items-center">

      
      <h2 className="text-xl font-bold text-blue-600">
        Agent Panel
      </h2>

      
      <div className="flex items-center gap-5">

      
        <button className="relative text-gray-700 hover:text-blue-600">
          <Bell className="w-6 h-6" />

         
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
            3
          </span>
        </button>

        
        <button className="text-red-600 hover:text-red-800">
          <LogOut className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};

export default AgentNavbar;
