import { useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";

const Profile = () => {
  const [name, setName] = useState("");
  const email = "admin@example.com"; // read-only

  return (
    <SettingsLayout
      title="Profile"
      subtitle="Manage your personal information"
    >

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div>
          <label className="text-sm font-medium text-slate-600">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className="mt-2 w-full h-10 rounded-md border border-slate-200 bg-slate-100 px-3 text-sm"
          />
        </div>

      </div>

      <div className="flex justify-end mt-8">
        <button className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Update Profile
        </button>
      </div>

    </SettingsLayout>
  );
};

export default Profile;
