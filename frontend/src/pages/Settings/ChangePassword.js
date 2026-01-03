import { useState } from "react";
import SettingsLayout from "../../components/SettingsLayout";

const ChangePassword = () => {
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  return (
    <SettingsLayout
      title="Change Password"
      subtitle="Update your account password"
    >

      <div className="max-w-md space-y-5">

        <input
          type="password"
          placeholder="Current Password"
          className="w-full h-10 border rounded-md px-3"
          onChange={(e) => setForm({ ...form, current: e.target.value })}
        />

        <input
          type="password"
          placeholder="New Password"
          className="w-full h-10 border rounded-md px-3"
          onChange={(e) => setForm({ ...form, newPass: e.target.value })}
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          className="w-full h-10 border rounded-md px-3"
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />

        <div className="flex justify-end">
          <button className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Update Password
          </button>
        </div>

      </div>

    </SettingsLayout>
  );
};

export default ChangePassword;
