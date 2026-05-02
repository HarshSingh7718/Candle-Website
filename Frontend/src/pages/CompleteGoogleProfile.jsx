import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from "../context/StoreContext";
import { useSendGooglePhoneOtp, useVerifyGooglePhone } from '../hooks/useAuth';

const CompleteGoogleProfile = () => {
    // UI State
    const [step, setStep] = useState(1); // Step 1: Phone, Step 2: OTP
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otp, setOtp] = useState(new Array(6).fill(""));

    const navigate = useNavigate();
    const { setUser } = useStore();

    // Pull in our mutations
    const sendOtpMutation = useSendGooglePhoneOtp();
    const verifyPhoneMutation = useVerifyGooglePhone();

    // --- STEP 1: Request OTP ---
    const handleSendOtp = (e) => {
        e.preventDefault();

        // Match backend regex roughly on frontend
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phoneNumber)) {
            return toast.error("Please enter a valid 10-digit Indian mobile number");
        }

        sendOtpMutation.mutate(phoneNumber, {
            onSuccess: () => {
                setStep(2); // Move to OTP step on success!
            }
        });
    };

    // --- STEP 2: Verify OTP ---
    const handleOtpChange = (element, index) => {
        if (isNaN(element.value)) return false;
        setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))]);

        // Auto-focus next input
        if (element.nextSibling && element.value !== "") {
            element.nextSibling.focus();
        }
    };

    const handleVerify = (e) => {
        e.preventDefault();
        const code = otp.join("");
        if (code.length !== 6) return toast.error("Please enter the 6-digit code");

        verifyPhoneMutation.mutate({
            phoneNumber: phoneNumber,
            otp: code
        }, {
            onSuccess: (data) => {
                if (data.user) setUser(data.user);
                navigate('/account'); // Send to dashboard!
            }
        });
    };

    return (
        <div className="flex w-full h-screen bg-[#f9fafb] overflow-hidden">

            {/* Left Side (Fixed/Static) */}
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
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] mb-6 tracking-tight font-serif text-white">
                        Illuminate Your<br />Space with Soul.
                    </h1>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[65%] h-full flex flex-col justify-center items-center px-6 py-12 hide-scrollbar overflow-y-auto bg-[#fafafa]">

                <div className="w-full max-w-[420px]">

                    {step === 1 ? (
                        /* --- STEP 1: PHONE NUMBER FORM --- */
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <header className='text-center mb-8'>
                                <h2 className='text-[32px] font-bold text-[#111827] tracking-tight mb-2'>
                                    Almost there!
                                </h2>
                                <p className='text-gray-500 text-[14px]'>
                                    Please provide your mobile number so we can send you delivery updates for your orders.
                                </p>
                            </header>

                            <form className='space-y-4' onSubmit={handleSendOtp}>
                                <div className="space-y-1.5 text-left">
                                    <label className="block text-[13px] font-medium text-gray-600">Mobile Number</label>
                                    <input
                                        required
                                        name="phoneNumber"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        type="tel"
                                        placeholder="9876543210"
                                        maxLength="10"
                                        className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                                    />
                                </div>

                                <button
                                    disabled={sendOtpMutation.isPending}
                                    type="submit"
                                    className='w-full py-3 mt-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] cursor-pointer disabled:bg-gray-400'
                                >
                                    {sendOtpMutation.isPending ? "Sending OTP..." : "Send Verification Code"}
                                </button>
                            </form>
                        </div>

                    ) : (

                        /* --- STEP 2: OTP VERIFICATION FORM --- */
                        <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                            <header className='text-center mb-10'>
                                <h2 className='text-[32px] font-bold text-[#111827] tracking-tight mb-2'>Verify Mobile</h2>
                                <p className='text-gray-500 text-[15px]'>
                                    Enter the 6-digit code sent to <br />
                                    <span className="font-semibold text-gray-700">+91 {phoneNumber}</span>
                                </p>
                            </header>

                            <form className='space-y-8' onSubmit={handleVerify}>
                                <div className="flex justify-center gap-2 md:gap-4">
                                    {otp.map((data, index) => (
                                        <input
                                            className="w-12 h-12 md:w-16 md:h-16 bg-white border border-gray-200 rounded-[16px] text-center text-2xl font-bold text-gray-800 focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] outline-none transition-all shadow-sm"
                                            type="text"
                                            maxLength="1"
                                            key={index}
                                            value={data}
                                            onChange={e => handleOtpChange(e.target, index)}
                                            onFocus={e => e.target.select()}
                                            onKeyDown={e => {
                                                if (e.key === 'Backspace' && !data && e.target.previousSibling) {
                                                    e.target.previousSibling.focus();
                                                }
                                            }}
                                        />
                                    ))}
                                </div>

                                <div className="text-center text-[13px] text-gray-500">
                                    Didn't receive the code? {" "}
                                    <button
                                        type="button"
                                        onClick={handleSendOtp} // Re-uses the Step 1 function!
                                        className="text-[#ea580c] font-bold hover:underline cursor-pointer"
                                    >
                                        Resend OTP
                                    </button>
                                </div>

                                <button
                                    disabled={verifyPhoneMutation.isPending}
                                    type="submit"
                                    className='w-full py-3 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[15px] cursor-pointer disabled:bg-gray-400'
                                >
                                    {verifyPhoneMutation.isPending ? "Verifying..." : "Verify and Proceed"}
                                </button>

                                <div className="text-center mt-4">
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-[13px] text-gray-400 hover:text-gray-600 underline"
                                    >
                                        Change mobile number
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default CompleteGoogleProfile;