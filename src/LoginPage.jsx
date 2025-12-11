import React, { useState } from "react";

import { Eye, EyeOff, Lock, Mail, ArrowRight } from "lucide-react";

import axiosMethods from "../axiosConfig";

import { useNavigate } from "react-router-dom";

import { toast } from "react-toastify";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [rememberMe, setRememberMe] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");

    setLoading(true);

    try {
      const response = await axiosMethods.post("/login", {
        email: email,
        password_hash: password,
      });

      if (response?.token) {
        sessionStorage.setItem("token", response.token);
        if (response.user?.role) {
          sessionStorage.setItem("userRole", response.user.role);
        }
        if (response.user) {
          sessionStorage.setItem("user", JSON.stringify(response.user));
        }
        window.dispatchEvent(new Event("authChange"));
        toast.success(response.message || "Login Successful!");
        navigate("/");
      } else {
        toast.error(response?.message || "Login failed");

        setError(response?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      setError(err.response?.data?.message || "Something went wrong.");

      toast.error(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Blobs */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-black rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>

        <div
          className="absolute -bottom-40 -right-40 w-96 h-96 bg-gray-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "0.5s" }}
        ></div>

        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gray-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      <div className="w-full max-w-xl relative z-10">
        {/* Header */}

        <div className="text-center mb-5">
          <h1 className="text-3xl font-serif sm:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Digital Marketing CRM
          </h1>

          {/* <p className="text-gray-600 text-sm sm:text-base font-medium">Accounting Panel</p> */}
        </div>

        {/* Login Card */}

        <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Welcome Back
            </h2>

            <p className="text-gray-500 text-sm mt-2">
              Sign in to your account to continue
            </p>
          </div>

          <div className="space-y-5">
            {/* Error Message */}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-medium animate-in fade-in">
                {error}
              </div>
            )}

            {/* Email Field */}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-900 mb-2.5"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-900 mb-2.5"
              >
                Password
              </label>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                  className="w-full pl-11 pr-11 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all disabled:bg-gray-50 disabled:cursor-not-allowed text-gray-900 placeholder-gray-400 text-sm sm:text-base"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black focus:ring-2 focus:ring-black disabled:cursor-not-allowed accent-black"
                />

                <span className="text-sm text-gray-600 font-medium">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                disabled={loading}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Forgot Password?
              </button>
            </div>

            {/* Sign In Button */}

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-black cursor-pointer text-white py-3 rounded-lg font-semibold hover:bg-[#161616] transition-all disabled:bg-gray-400 disabled:cursor-not-allowed mt-6 group flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}

        <div className="text-center mt-4 text-xs text-gray-500 px-4">
          © 2025 Bots Courier. All rights reserved.
        </div>
      </div>
    </div>
  );
}
