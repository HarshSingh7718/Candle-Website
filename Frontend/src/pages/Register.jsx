import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; // Assuming your axios instance is here
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthActions, useGoogleLogin } from '../hooks/useAuth';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const { sendRegistrationOtp, isSendingRegOtp } = useAuthActions();
    const googleLoginMutation = useGoogleLogin();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Handle Form Submission
    const handleRegisterInitiate = async (e) => {
        e.preventDefault();

        // Basic validation
        if (formData.password !== formData.confirmPassword) {
            return toast.error("Passwords do not match!");
        }

        setLoading(true);
        try {
            // Step 1: Trigger the OTP on the backend
            const { data } = await API.post("/auth/user/send-otp", { 
                phoneNumber: formData.phoneNumber 
            });

            if (data.success) {
                toast.success("OTP sent to your mobile");
                // Step 2: Navigate to Verify page, passing the registration data forward
                navigate('/verify-otp', { state: { registrationData: formData } });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex w-full h-screen bg-[#f9fafb] overflow-hidden">
            
            {/* Left Side (Image & Brand) - UI Unchanged */}
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
                        Illuminate Your<br/>Space with Soul.
                    </h1>
                    <p className="text-gray-200 text-md leading-relaxed max-w-md font-light">
                        Experience the craftsmanship of premium hand-poured candles, designed to bring warmth and tranquility to your home.
                    </p>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[65%] h-full flex flex-col items-center px-6 py-12 overflow-y-auto bg-[#fafafa]">
                
                <div className="w-full max-w-[420px]">
                    <header className='text-center mb-4'>
                        <h2 className='text-[32px] font-bold text-[#111827] tracking-tight mb-2'>
                            Create Account
                        </h2>
                        <p className='text-gray-500 text-[14px]'>
                            Please enter your details to create an account.
                        </p>
                    </header>

                    {/* Form Connected to handleRegisterInitiate */}
                    <form className='space-y-3' onSubmit={handleRegisterInitiate}>
                        
                        <div className="flex justify-center w-full mt-2 mb-4">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    googleLoginMutation.mutate(credentialResponse.credential, {
                                        onSuccess: (data) => {
                                            if (data.needsPhone) {
                                                toast.success("Almost done! Please link your mobile number.");
                                                navigate('/complete-google-profile');
                                            } else {
                                                toast.success("Account created via Google successfully!");
                                                navigate('/');
                                            }
                                        },
                                        onError: (error) => {
                                            toast.error(error.response?.data?.message || "Google Authentication Failed");
                                        }
                                    });
                                }}
                                onError={() => toast.error('Google Login Popup Closed')}
                                width="100%"
                                shape="pill"
                                theme="filled_black"        // Options: 'outline', 'filled_blue', 'filled_black'
                                text="continue_with"   // Options: 'signin_with', 'signup_with', 'continue_with'
                            />
                        </div>

                        <div className="flex items-center my-3">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className='px-4 text-gray-400 text-[13px] font-medium'>Or continue with email</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                         <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">First Name</label>
                            <input 
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text" 
                                placeholder="John" 
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                            />
                        </div>

                         <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Last Name</label>
                            <input 
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text" 
                                placeholder="Doe" 
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Email Address</label>
                            <input 
                                required
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                type="email" 
                                placeholder="name@example.com" 
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Mobile Number</label>
                            <input 
                                required
                                name="phoneNumber"
                                type="tel" 
                                placeholder="9876543210" 
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                            />
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Password</label>
                            <div className="relative">
                                <input 
                                    required
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all pr-12"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} strokeWidth={1.5} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Confirm Password</label>
                            <div className="relative">
                                <input 
                                    required
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    type={showPassword ? "text" : "password"} 
                                    placeholder="••••••••" 
                                    className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all pr-12"
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            className='w-full py-3 mt-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] cursor-pointer disabled:opacity-50'
                        >
                            {loading ? "Sending OTP..." : "Create Account"}
                        </button>
                    </form>

                    <div className="text-center mt-4 text-[14px] text-gray-500">
                        Already have an account? {" "}
                        <Link to="/signin" className="text-[#ea580c] font-bold hover:underline">
                            Sign in
                        </Link>
                    </div>
                 
                </div>
            </div>
        </div>
    )
}

export default Register;