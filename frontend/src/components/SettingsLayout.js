import { Outlet } from "react-router-dom";

const SettingsLayout = () => {
  return (
    <div className="bg-white rounded-xl border border-slate-200">

      {/* HEADER (SAME FOR ALL SETTINGS PAGES) */}
      <div className="px-6 py-4 border-b bg-slate-100">
        <h1 className="text-lg font-semibold text-slate-800">
          Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage application and account settings
        </p>
      </div>

      {/* PAGE CONTENT */}
      <div className="p-6">
        <Outlet />
      </div>

    </div>
  );
};

export default SettingsLayout;
