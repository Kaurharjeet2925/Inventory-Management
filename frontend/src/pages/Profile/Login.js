import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { apiClient } from '../../apiclient/apiclient';
import { useNavigate } from 'react-router-dom';

export default function Login({ onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoutTimerRef = useRef(null);

  // Decode JWT payload to extract expiry
  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Clear auth and logout
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
  };

  // Schedule automatic logout when token expires
  const scheduleAutoLogout = useCallback((expiryMs) => {
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    const ms = expiryMs - Date.now();
    if (ms <= 0) {
      clearAuth();
      return;
    }
    logoutTimerRef.current = setTimeout(() => {
      clearAuth();
      toast.info('Your session has expired. Please log in again.');
      navigate('/');
    }, ms);
  }, [navigate]);
 
  useEffect(() => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    if (user.role === "delivery-boy") {
      navigate("/agent/agent-dashboard");
    } else {
      navigate("/dashboard");
    }
  }
}, [navigate]);

  // Check for existing token on mount and schedule logout if present
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = parseJwt(token);
      if (decoded?.exp) {
        const expiryMs = decoded.exp * 1000;
        if (expiryMs > Date.now()) {
          // Schedule logout at expiry time
          scheduleAutoLogout(expiryMs);
        } else {
          // Token already expired, clear it
          clearAuth();
        }
      }
    }
    return () => {
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current);
    };
  }, [navigate, scheduleAutoLogout]);

  const validateEmail = (value) => {
    if (!value) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return 'Enter a valid email address';
    return undefined;
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await apiClient.post("/login", { email, password });
      const data = response.data;

      if (data?.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        
        // Schedule auto-logout when token expires
        const decoded = parseJwt(data.token);
        if (decoded?.exp) {
          const expiryMs = decoded.exp * 1000;
          scheduleAutoLogout(expiryMs);
        }
        
        toast.success(`Login successful! Welcome ${data.user.name}`);
setEmail("");
setPassword("");

// 🔑 ROLE-BASED REDIRECT
if (data.user.role === "superAdmin") {
  navigate("/dashboard"); // SuperAdmin dashboard
} else if (data.user.role === "admin") {
  navigate("/dashboard"); // Admin dashboard (same page)
} else if (data.user.role === "delivery-boy") {
  navigate("/agent/agent-dashboard"); // Agent dashboard
} else {
  navigate("/"); // fallback
}

      } else {
        toast.error(data?.message || "Login failed");
      }
    } catch (err) {
      toast.error("Login failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg w-full max-w-md p-6">
        <h3 className="text-center text-2xl font-bold mb-6">Login</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Switch to Signup */}
          {/* <p className="text-center text-sm mt-3">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={onSwitch}
              className="text-blue-500 hover:underline"
            >
              Sign Up
            </button>
          </p> */}
        </form>
      </div>
    </div>
  );
}
