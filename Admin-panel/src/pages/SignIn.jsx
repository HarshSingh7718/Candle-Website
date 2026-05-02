import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAdminLogin } from "../hooks/useAdminAuth";

export default function SignIn() {
    // 1. Reverted to a single identifier state
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const navigate = useNavigate();
    const { mutateAsync: loginAdmin, isPending } = useAdminLogin();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 2. Passing the identifier instead of email
            await loginAdmin({ identifier, password });
            navigate("/dashboard");
        } catch (error) {
            console.error("Login failed");
        }
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
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-sm tracking-wider border border-white/30">nc</div>
                        <span className="text-xl font-bold tracking-wide">Naisha Creations</span>
                    </div>
                    <h1 className="text-[2.5rem] font-bold leading-[1.1] mb-6 tracking-tight font-serif text-white">
                        Illuminate Your<br />Space with Soul.
                    </h1>
                    <p className="text-gray-200 text-md leading-relaxed max-w-md font-light">
                        Admin Control Panel. Manage orders, customize inventory, and oversee operations seamlessly.
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
                            Please enter your credentials to access the dashboard.
                        </p>
                    </header>

                    <form className='space-y-4' onSubmit={handleSubmit}>
                        {/* Identifier (Email or Mobile) */}
                        <div className="space-y-1.5 text-left">
                            <label className="block text-[13px] font-medium text-gray-600">Email or Mobile Number</label>
                            <input
                                required
                                name="identifier"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                type="text"
                                placeholder="name@example.com or 9876543210"
                                disabled={isPending}
                                className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] placeholder:text-gray-300 text-[14px] transition-all disabled:opacity-60"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    disabled={isPending}
                                    className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-[20px] focus:outline-none focus:border-[#ea580c] focus:ring-1 focus:ring-[#ea580c] placeholder:text-gray-300 text-[14px] transition-all pr-12 disabled:opacity-60"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#ea580c] cursor-pointer transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} strokeWidth={1.5} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            disabled={isPending}
                            type="submit"
                            className='w-full py-2.5 mt-4 bg-[#ea580c] hover:bg-[#c2410c] text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] cursor-pointer disabled:bg-gray-400 disabled:shadow-none flex justify-center items-center gap-2'
                        >
                            {isPending ? (
                                <>
                                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}