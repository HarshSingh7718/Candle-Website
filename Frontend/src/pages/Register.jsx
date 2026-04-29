import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api'; // Assuming your axios instance is here
import toast from 'react-hot-toast';

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 1. Unified State for Form Data
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
            <div className="w-full lg:w-[65%] h-full flex flex-col justify-center items-center px-6 py-12 overflow-y-auto bg-[#fafafa]">
                
                <div className="w-full max-w-[420px] my-auto">
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
                        
                        <button type="button" className="flex items-center justify-center gap-2 w-full py-2.5 bg-white text-gray-700 font-semibold rounded-[20px] border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
                            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Google
                        </button>

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