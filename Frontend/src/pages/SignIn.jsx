import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';
import { useStore } from "../context/StoreContext";
import { useLogin, useGoogleLogin } from '../hooks/useAuth'; // IMPORT THE NEW HOOK

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { setUser } = useStore();

    // Pull in our mutations
    const loginMutation = useLogin();
    const googleLoginMutation = useGoogleLogin();

    // Form State
    const [formData, setFormData] = useState({
        identifier: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.identifier || !formData.password) {
            return toast.error("Please enter your credentials");
        }

        loginMutation.mutate({
            identifier: formData.identifier,
            password: formData.password
        }, {
            onSuccess: (data) => {
                toast.success(`Welcome back, ${data.user.firstName}!`);
                setUser(data.user);
                navigate('/');
            },
            onError: (error) => {
                toast.error(error.response?.data?.message || "Invalid credentials");
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
                    <p className="text-gray-200 text-md leading-relaxed max-w-md font-light">
                        Experience the craftsmanship of premium hand-poured candles, designed to bring warmth and tranquility to your home.
                    </p>
                </div>
            </div>

            {/* Right Side (Form) */}
            <div className="w-full lg:w-[65%] h-full flex flex-col items-center px-6 py-12 overflow-y-auto bg-[#fafafa]">

                <div className="w-full max-w-[420px] my-auto">
                    <header className='text-center mb-8'>
                        <h2 className='text-[32px] font-bold text-[#111827] tracking-tight mb-2'>
                            Welcome Back
                        </h2>
                        <p className='text-gray-500 text-[14px]'>
                            Please enter your details to sign in.
                        </p>
                    </header>

                    <form className='space-y-4' onSubmit={handleSubmit}>

                        {/* 👉 CLEANED UP GOOGLE BUTTON 👈 */}
                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={(credentialResponse) => {
                                    // Pass callbacks here so the UI can react!
                                    googleLoginMutation.mutate(credentialResponse.credential, {
                                        onSuccess: (data) => {
                                            if (data.needsPhone) {
                                                toast.success("Almost done! Please link your mobile number.");
                                                navigate('/complete-google-profile');
                                            } else {
                                                toast.success("Signed in with Google successfully!");
                                                if (data.user) setUser(data.user);
                                                navigate('/');
                                            }
                                        },
                                        onError: (error) => {
                                            toast.error(error.response?.data?.message || "Google Authentication Failed");
                                        }
                                    });
                                }}
                                onError={() => toast.error('Google Login Popup Closed or Failed')}
                                shape="pill"
                                size="large"
                                width="100%"
                                text="continue_with"
                            />
                        </div>

                        <div className="flex items-center my-6">
                            <div className="flex-1 h-px bg-gray-200"></div>
                            <span className='px-4 text-gray-400 text-[13px] font-medium'>Or continue with credentials</span>
                            <div className="flex-1 h-px bg-gray-200"></div>
                        </div>

                        {/* Identifier (Email or Mobile) */}
                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Email or Mobile Number</label>
                            <input
                                required
                                name="identifier"
                                value={formData.identifier}
                                onChange={handleChange}
                                type="text"
                                placeholder="name@example.com or 9876543210"
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-gray-400 focus:ring-1 focus:ring-gray-400 placeholder:text-gray-300 text-[14px] transition-all"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5 text-left">
                            <div className="flex justify-between items-center">
                                <label className="block text-[13px] font-medium text-gray-600">Password</label>
                                <Link to="/forgot-password" className="text-[13px] font-bold text-[#ea580c] hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
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

                        {/* Remember Me */}
                        <div className="flex items-center pt-2 pb-2 text-left">
                            <input
                                type="checkbox"
                                id="remember"
                                className="w-4 h-4 rounded border-gray-300 text-[#ea580c] focus:ring-[#ea580c]"
                            />
                            <label htmlFor="remember" className="ml-2 text-[13px] text-gray-500 cursor-pointer">
                                Remember me for 30 days
                            </label>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={loginMutation.isPending || googleLoginMutation.isPending}
                            type="submit"
                            className='w-full py-2.5 mt-2 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] cursor-pointer disabled:bg-gray-400'
                        >
                            {loginMutation.isPending ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="text-center mt-4 text-[14px] text-gray-500">
                        Don't have an account? {" "}
                        <Link to="/register" className="text-[#ea580c] font-bold hover:underline">
                            Create an account
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignIn;