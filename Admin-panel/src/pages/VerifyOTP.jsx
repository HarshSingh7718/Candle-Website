import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(""));
    const location = useLocation();
    const navigate = useNavigate();
    
    // Fallback if accessed without passing state
    const phone = location.state?.phone || "your number";

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        const code = otp.join("");
        if(code.length === 6) {
            toast.success("Verification successful!");
            navigate('/reset-password');
        } else {
            toast.error("Please enter a 6-digit code");
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
                            Verify OTP
                        </h2>
                        <p className='text-text-muted text-[15px]'>
                            Enter the 6-digit code sent to <br />
                            <span className="font-semibold text-gray-700">{phone.includes('your') ? phone : `+91 ${phone}`}</span>
                        </p>
                    </header>

                    {/* Form */}
                    <form className='space-y-8' onSubmit={handleVerify}>
                        
                        {/* OTP Boxes */}
                        <div className="flex justify-center gap-2 md:gap-4">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className="w-12 h-12 md:w-16 md:h-16 bg-bg-surface border border-bg-muted rounded-[16px] text-center text-2xl font-bold text-gray-800 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all shadow-sm"
                                        type="text"
                                        name="otp"
                                        maxLength="1"
                                        key={index}
                                        value={data}
                                        onChange={e => handleChange(e.target, index)}
                                        onFocus={e => e.target.select()}
                                        onKeyDown={e => {
                                            if(e.key === 'Backspace' && !data && e.target.previousSibling) {
                                                e.target.previousSibling.focus();
                                            }
                                        }}
                                    />
                                );
                            })}
                        </div>
                        
                        {/* Resend Link */}
                        <div className="text-center text-[13px] text-text-muted">
                            Didn't receive the code? {" "}
                            <button type="button" className="text-brand-primary font-bold hover:underline cursor-pointer">
                                Resend OTP
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button type="submit" className='w-full py-3 bg-brand-primary hover:bg-coffee-800 text-white font-bold rounded-lg transition-all shadow-md shadow-brand-primary/30 text-[15px] cursor-pointer'>
                            Verify and Proceed
                        </button>
                    </form>

                    {/* Back Link */}
                    {/* <div className="text-center mt-8 text-[14px] text-text-muted">
                        <Link to="/forgot-password" className="text-text-muted hover:text-brand-primary font-medium transition-colors">
                            ← Change mobile number
                        </Link>
                    </div> */}

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

export default VerifyOTP;
