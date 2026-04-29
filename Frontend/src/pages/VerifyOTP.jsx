import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import API from '../../api';
import { useStore } from "../../context/StoreContext";

const VerifyOTP = () => {
    const [otp, setOtp] = useState(new Array(4).fill(""));
    const [loading, setLoading] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { setUser } = useStore();
    
    // Retrieve the full registration data passed from the Register page
    const registrationData = location.state?.registrationData;
    const phone = registrationData?.phoneNumber || "your number";

    // Redirect if no registration data is present (prevents direct URL access errors)
    useEffect(() => {
        if (!registrationData) {
            toast.error("Invalid session. Please start registration again.");
            navigate('/register');
        }
    }, [registrationData, navigate]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return false;

        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleResendOtp = async () => {
        try {
            await API.post("/auth/user/send-otp", { phoneNumber: phone });
            toast.success("OTP resent successfully!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to resend OTP");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const code = otp.join("");
        
        if(code.length !== 4) {
            return toast.error("Please enter a 4-digit code");
        }

        setLoading(true);
        try {
            // STEP 1: Verify OTP and get the tempToken
            const verifyRes = await API.post("/auth/user/verify-otp", {
                phoneNumber: phone,
                otp: code
            });

            if (verifyRes.data.success) {
                const tempToken = verifyRes.data.tempToken;

                // STEP 2: Complete Profile using the data from Register page + tempToken
                const completeRes = await API.post("/auth/user/complete-profile", registrationData, {
                    headers: {
                        Authorization: `Bearer ${tempToken}`
                    }
                });

                if (completeRes.data.success) {
                    toast.success("Verification successful!");
                    setUser(completeRes.data.user); // Update global auth state
                    navigate('/'); // Redirect home
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Verification failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen bg-[#f9fafb] overflow-hidden">
            {/* Left Side (Image & Brand) - UI UNCHANGED */}
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

            {/* Right Side (Form) - UI UNCHANGED */}
            <div className="w-full lg:w-[65%] h-full flex flex-col justify-center items-center px-6 py-12 overflow-y-auto bg-[#fafafa]">
                
                <div className="w-full max-w-[420px]">
                    <header className='text-center mb-10'>
                        <h2 className='text-[32px] font-bold text-[#111827] tracking-tight mb-2'>
                            Verify OTP
                        </h2>
                        <p className='text-gray-500 text-[15px]'>
                            Enter the 4-digit code sent to <br />
                            <span className="font-semibold text-gray-700">{phone === "your number" ? phone : `+91 ${phone}`}</span>
                        </p>
                    </header>

                    <form className='space-y-8' onSubmit={handleVerify}>
                        <div className="flex justify-center gap-4">
                            {otp.map((data, index) => {
                                return (
                                    <input
                                        className="w-16 h-16 bg-white border border-gray-200 rounded-[16px] text-center text-2xl font-bold text-gray-800 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] outline-none transition-all shadow-sm"
                                        type="text"
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
                        
                        <div className="text-center text-[13px] text-gray-500">
                            Didn't receive the code? {" "}
                            <button 
                                type="button" 
                                onClick={handleResendOtp}
                                className="text-[#ea580c] font-bold hover:underline cursor-pointer"
                            >
                                Resend OTP
                            </button>
                        </div>

                        <button 
                            disabled={loading}
                            type="submit" 
                            className='w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[15px] cursor-pointer disabled:bg-gray-400'
                        >
                            {loading ? "Verifying..." : "Verify and Proceed"}
                        </button>
                    </form>

                    <div className="flex justify-center gap-6 mt-16 text-[12px] text-gray-400">
                        <Link to="#" className="hover:text-gray-600 transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-gray-600 transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-gray-600 transition-colors">Support</Link>
                    </div>

                </div>
            </div>
        </div>
    )
}

export default VerifyOTP;