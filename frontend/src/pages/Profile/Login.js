import React, { useState, useRef, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { apiClient } from "../../apiclient/apiclient";
import { useNavigate } from "react-router-dom";
import { reconnectSocketWithToken } from "../../socket/socketClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const logoutTimerRef = useRef(null);

  /* ================= JWT UTILS ================= */

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      return JSON.parse(atob(base64));
    } catch {
      return null;
    }
  };

  /* ================= AUTH HELPERS ================= */

  const clearAuth = useCallback(() => {
    localStorage.clear();
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    navigate("/");
  }, [navigate]);

  const scheduleAutoLogout = useCallback(
    (expiryMs) => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);

      const ms = expiryMs - Date.now();
      if (ms <= 0) {
        clearAuth();
        return;
      }

      logoutTimerRef.current = setTimeout(() => {
        toast.info("Session expired. Please log in again.");
        clearAuth();
      }, ms);
    },
    [clearAuth]
  );

  /* ================= AUTO LOGIN (SAME DAY) ================= */

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    if (!token || !user) return;

    const decoded = parseJwt(token);
    if (!decoded || decoded.exp * 1000 < Date.now()) {
      clearAuth();
      return;
    }

    scheduleAutoLogout(decoded.exp * 1000);

    if (user.role === "delivery-boy") {
      navigate("/agent/agent-dashboard");
    } else {
      navigate("/dashboard");
    }
  }, [navigate, scheduleAutoLogout, clearAuth]);

  /* ================= VALIDATION ================= */

  const validateEmail = (v) =>
    !v
      ? "Email is required"
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
      ? "Invalid email"
      : null;

  const validatePassword = (v) =>
    !v ? "Password required" : v.length < 6 ? "Min 6 characters" : null;

  /* ================= LOGIN ================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setErrors({ email: emailErr, password: passErr });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const { data } = await apiClient.post("/login", { email, password });

      if (!data?.token) {
        toast.error("Login failed");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      const decoded = parseJwt(data.token);
      if (decoded?.exp) {
        scheduleAutoLogout(decoded.exp * 1000);
      }

      reconnectSocketWithToken();

      toast.success(`Welcome ${data.user.name}`);

      if (data.user.role === "delivery-boy") {
        navigate("/agent/agent-dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <h2 className="text-center text-2xl font-bold mb-6">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="text-sm font-semibold">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2 mt-1"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2 mt-1"
                disabled={loading}
              />
              <button
                type="button"
                className="absolute right-2 top-3 text-sm text-gray-500"
                onClick={() => setShowPassword((s) => !s)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
  