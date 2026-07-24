import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthActions } from "../hooks/useAuth"; // Import the new hook
import SEO from '../components/SEO';
import BackButton from '../components/ui/BackButton';

const ForgotPassword = () => {
  const [phoneNumber, setPhone] = useState("");
  const navigate = useNavigate();
  const { forgotPassword, isSendingOtp } = useAuthActions();

  const handleSendOtp = async (e) => {
    e.preventDefault();

    // Basic validation for Indian phone numbers
    if (phoneNumber.length === 10) {
      try {
        // Call the backend via our hook
        await forgotPassword(phoneNumber);

        navigate("/verify-otp", { state: { phoneNumber } });
      } catch (error) {
        // Error is handled by the hook's toast
        console.error("Forgot Password Error:", error);
      }
    } else {
      alert("Please enter a valid 10-digit mobile number.");
    }
  };

  return (
    <>
      <SEO
        title="Forgot Password - Naisha Creations"
        description="Reset your password to continue shopping."
      />
      <div className="flex w-full h-screen bg-bg-surface-hover overflow-hidden">
        {/* Left Side (Image & Brand) - Stays same as your code */}
        <div className="hidden lg:block relative w-[35%] h-full bg-text-base overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000"
            alt="Candle"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

          <div className="absolute inset-x-14 bottom-20 text-text-on-brand z-10 text-left">
            <Link
              to="/"
              className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-sm tracking-wider border border-white/30">
                nc
              </div>
              <span className="text-xl font-bold tracking-wide">
                Naisha Creations
              </span>
            </Link>
            <h1 className="text-[2.5rem] font-bold leading-[1.1] mb-6 tracking-tight font-serif text-text-on-brand">
              Illuminate Your
              <br />
              Space with Soul.
            </h1>
            <p className="text-gray-200 text-md leading-relaxed max-w-md font-light">
              Experience the craftsmanship of premium hand-poured candles...
            </p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="w-full lg:w-[65%] h-full flex flex-col justify-center items-center px-6 py-12 hide-scrollbar overflow-y-auto bg-[#fafafa]">
          <div className="w-full max-w-[420px]">
            <BackButton className="mb-4" />
            <header className="text-center mb-10">
              <h2 className="text-[32px] font-bold text-[#111827] tracking-tight mb-2">
                Forgot Password
              </h2>
              <p className="text-text-muted text-[15px]">
                Enter your registered mobile number to receive a secure OTP.
              </p>
            </header>

            <form className="space-y-6" onSubmit={handleSendOtp}>
              <div className="space-y-1.5 text-left">
                <label className="block text-[13px] font-medium text-text-muted">
                  Mobile Number
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[15px] text-text-muted font-medium">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="Enter your 10-digit number"
                    value={phoneNumber}
                    disabled={isSendingOtp}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    required
                    className="w-full py-2.5 pl-14 pr-4 bg-bg-surface border border-bg-muted rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all disabled:bg-gray-50"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="w-full py-3 mt-6 bg-coffee-600 hover:bg-coffee-700 text-text-on-brand font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[15px] cursor-pointer disabled:bg-gray-400"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>

            <div className="text-center mt-8 text-[14px] text-text-muted">
              Remembered your password?{" "}
              <Link
                to="/signin"
                className="text-coffee-600 font-bold hover:underline"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
