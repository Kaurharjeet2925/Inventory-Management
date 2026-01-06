import { useState } from "react";
import { apiClient } from "../../apiclient/apiclient";
import PageContainer from "../../components/PageContainer";

const ChangePassword = () => {
  // hooks at top
  const [form, setForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  // block non-superAdmin
  if (!user || user.role !== "superAdmin") {
    return (
      <PageContainer>
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="bg-white rounded-xl shadow border border-red-200">
            <h2 className="text-lg font-semibold text-red-600">
              Access Denied
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Only Super Admin can change password.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (!form.current || !form.newPass || !form.confirm) {
      setError("All fields are required");
      return;
    }

    if (form.newPass !== form.confirm) {
      setError("New password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await apiClient.post("/change-password", {
        current: form.current,
        newPass: form.newPass,
        confirm: form.confirm,
      });

      setSuccess(res.data.message || "Password updated successfully");
      setForm({ current: "", newPass: "", confirm: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
   
      <div className="flex justify-center items-center ">
        <div className="w-full max-w-md bg-white rounded-xl shadow border border-slate-200 p-6">

          {/* HEADER */}
          <h2 className="text-xl font-semibold text-slate-800">
            Change Password
          </h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Update your Super Admin password
          </p>

          {/* ERROR */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          {/* SUCCESS */}
          {success && (
            <div className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
              {success}
            </div>
          )}

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              value={form.current}
              onChange={(e) =>
                setForm({ ...form, current: e.target.value })
              }
              className="w-full h-10 rounded-md border px-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <input
              type="password"
              placeholder="New Password"
              value={form.newPass}
              onChange={(e) =>
                setForm({ ...form, newPass: e.target.value })
              }
              className="w-full h-10 rounded-md border px-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-400"
            />

            <input
              type="password"
              placeholder="Confirm New Password"
              value={form.confirm}
              onChange={(e) =>
                setForm({ ...form, confirm: e.target.value })
              }
              className="w-full h-10 rounded-md border px-3 text-sm
                focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="
                px-6 py-2 rounded-md
                bg-blue-900 text-white text-sm font-medium
                hover:bg-amber-500 transition
                disabled:opacity-60
              "
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </div>
      </div>
  
  );
};

export default ChangePassword;
