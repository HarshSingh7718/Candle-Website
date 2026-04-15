import React, { useState } from 'react';
import { Phone, KeyRound, ArrowRight } from 'lucide-react';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    if(phone.length > 5) {
      setStep(2);
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if(otp.length >= 4) {
      alert("Password reset successful!");
      window.location.href = '/';
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 pt-24 relative z-0">
      <div className="relative w-full max-w-md bg-[#171717] rounded-[30px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden p-8 z-10">
        
        {/* Decorative Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        
        <div className="relative z-10">
          <header className='text-center mb-8'>
            <h2 className='text-3xl font-bold text-white tracking-tight'>
              {step === 1 ? "Forgot Password" : "Verify OTP"}
            </h2>
            <p className='text-gray-400 text-sm mt-2'>
              {step === 1 ? "Enter your registered mobile number" : "Enter the OTP sent to your number"}
            </p>
          </header>

          {step === 1 ? (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className='flex items-center gap-3 px-4 py-4 bg-[#0a0a0a] rounded-2xl border border-white/5 focus-within:border-white/20 focus-within:ring-1 ring-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] group'>
                <div className='text-gray-500 group-focus-within:text-white transition-colors'><Phone size={18} /></div>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  placeholder="Mobile Number" 
                  required
                  className='bg-transparent border-none outline-none w-full text-white placeholder-gray-600 text-sm' 
                />
              </div>
              <button type="submit" className='group relative w-full py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all active:scale-[0.98]'>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className='relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors'>
                  Send OTP <ArrowRight size={18} className='transition-transform group-hover:translate-x-1' />
                </span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className='flex items-center gap-3 px-4 py-4 bg-[#0a0a0a] rounded-2xl border border-white/5 focus-within:border-white/20 focus-within:ring-1 ring-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)] group'>
                <div className='text-gray-500 group-focus-within:text-white transition-colors'><KeyRound size={18} /></div>
                <input 
                  type="text" 
                  value={otp} 
                  onChange={(e) => setOtp(e.target.value)} 
                  placeholder="Enter 4-digit OTP" 
                  maxLength={6}
                  required
                  className='bg-transparent border-none outline-none w-full text-white placeholder-gray-600 tracking-[0.5em] text-center text-lg' 
                />
              </div>
              <button type="submit" className='group relative w-full py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all active:scale-[0.98]'>
                <div className="absolute inset-0 bg-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className='relative z-10 flex items-center justify-center gap-2 group-hover:text-white transition-colors'>
                  Verify & Reset <ArrowRight size={18} className='transition-transform group-hover:translate-x-1' />
                </span>
              </button>
              <div className="pt-2">
                <button type="button" onClick={() => setStep(1)} className="w-full text-sm text-gray-400 hover:text-white transition-colors text-center cursor-pointer">
                  Change Mobile Number
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
