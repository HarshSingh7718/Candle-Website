import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
    const [phone, setPhone] = useState('');
    const navigate = useNavigate();

    const handleSendOtp = (e) => {
        e.preventDefault();
        if(phone.length > 5) {
            // In a real app we'd dispatch an API call here.
            // Navigate to OTP page, passing the phone number via state so we can display it.
            navigate('/verify-otp', { state: { phone } });
        }
    };

    return (
        <div className="flex w-full h-screen bg-bg-canvas overflow-hidden">
            {/* Left Side (Image & Brand) */}
            <div className="hidden lg:block relative w-[35%] h-full bg-black overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&q=80&w=1000" 
                    alt="Candle" 
                    className="absolute inset-0 w-full h-full object-cover opacity-60" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                
                <div className="absolute inset-x-14 bottom-20 text-white z-10 text-left">
                    <Link to="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-sm tracking-wider border border-white/30">nc</div>
                        <span className="text-xl font-bold tracking-wide">Naisha Creations</span>
                    </Link>
                    <h1 className="text-[2rem] font-bold leading-[1.1] mb-6 tracking-tight font-serif text-white">
                        Illuminate Your<br/>Space with Soul.
                    </h1>
                    <p className="text-gray-200 text-md leading-relaxed max-w-md font-light">
                        Experience the craftsmanship of premium hand-poured candles, designed to bring warmth and tranquility to your home.
                    </p>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[65%] h-full flex flex-col justify-center items-center px-6 py-12 hide-scrollbar overflow-y-auto bg-bg-surface">
                
                <div className="w-full max-w-[420px]">
                    <header className='text-center mb-10'>
                        <h2 className='text-[32px] font-bold text-text-base tracking-tight mb-2'>
                            Forgot Password
                        </h2>
                        <p className='text-text-muted text-[15px]'>
                            Enter your registered mobile number to receive a secure OTP.
                        </p>
                    </header>

                    {/* Form */}
                    <form className='space-y-6' onSubmit={handleSendOtp}>
                        
                        {/* Phone Number */}
                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-text-muted">Mobile Number</label>
                            <div className="relative flex items-center">
                                {/* Country Code Prefix */}
                                <div className="absolute left-4 text-[15px] text-text-muted font-medium">
                                    +91
                                </div>
                                <input 
                                    type="tel" 
                                    placeholder="Enter your 10-digit number"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                    maxLength={10}
                                    required
                                    className="w-full py-2.5 pl-14 pr-4 bg-bg-surface border border-bg-muted rounded-lg focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-text-disabled text-[14px] transition-all"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className='w-full py-3 mt-6 bg-brand-primary hover:bg-coffee-800 text-white font-bold rounded-lg transition-all shadow-md shadow-brand-primary/30 text-[15px] cursor-pointer'>
                            Send OTP
                        </button>
                    </form>

                    {/* Back to Login */}
                    <div className="text-center mt-8 text-[14px] text-text-muted">
                        Remembered your password? {" "}
                        <Link to="/" className="text-brand-primary font-bold hover:underline">
                            Sign in
                        </Link>
                    </div>

                    {/* Footer Links */}
                    <div className="flex justify-center gap-6 mt-16 text-[12px] text-text-disabled">
                        <Link to="#" className="hover:text-text-muted transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-text-muted transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-text-muted transition-colors">Support</Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ForgotPassword;
