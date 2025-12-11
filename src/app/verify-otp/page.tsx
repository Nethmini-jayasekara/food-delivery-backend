"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Please enter a 6-digit OTP code");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5068/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "OTP verification failed");
      }

      setSuccess("OTP verified! Redirecting...");
      setTimeout(() => router.push(`/reset-password?email=${encodeURIComponent(email)}&otp=${otp}`), 1500);
    } catch (err: any) {
      setError(err.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    try {
      const response = await fetch("http://localhost:5068/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend OTP");
      }

      setSuccess("New OTP sent! Please check your email.");
    } catch (err: any) {
      setError(err.message || "Failed to resend OTP");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-red-900 py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🔑</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Enter OTP Code</h1>
            <p className="text-gray-600">
              We've sent a 6-digit code to:
              <br />
              <strong className="text-red-600">{email}</strong>
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                OTP Code
              </label>
              <input
                id="otp"
                type="text"
                required
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none transition text-center text-2xl font-bold tracking-widest"
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />
              <p className="text-xs text-gray-500 mt-1">Code expires in 15 minutes</p>
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-2">Didn't receive the code?</p>
            <button
              onClick={handleResend}
              className="text-red-600 font-semibold hover:text-red-700"
            >
              Resend OTP
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link href="/forgot-password" className="text-gray-600 hover:text-red-600 transition">
              ← Try Different Email
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
