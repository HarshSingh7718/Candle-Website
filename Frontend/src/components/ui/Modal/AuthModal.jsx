import React, { useEffect, useState } from 'react'
import { X, Lock, User, Mail, ArrowRight } from 'lucide-react'

const AuthModal = ({ isOpen, onClose }) => {
    const [isLogin, setIsLogin] = useState(true);

    // Handle body scroll lock

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <>
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-all duration-300 ${isOpen ?"opacity-100":"opacity-0 pointer-events-none"}`}>
            {/* Backdrop with Blur */}
<div
  className="absolute inset-0 bg-black/80 backdrop-blur-md"
  onClick={onClose}
></div>

{/* Modal Card */}
<div className={`relative w-full max-w-md bg-[#171717] rounded-[30px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden transition-all duration-500 ease-out transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-10'}`}>
  
  {/* Top Left Glow */}
  <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>
  
  {/* Bottom Right Glow */}
  <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

  <button
  onClick={onClose}
  className='absolute top-6 right-6 text-gray-500 hover:text-white transition-colors z-20'
>
  <X size={20} />
</button>

<div className="relative z-10 p-8">
  <header className='text-center mb-8'>
    <h2 className='text-3xl font-bold text-white tracking-tight'>
      {isLogin ? "Welcome Back" : "Join Us"}
    </h2>
    <p className='text-gray-400 text-sm mt-2'>
      {isLogin ? "Login to access your dashboard" : "Create an account to get started"}
    </p>
  </header>
<form className='space-y-4' onSubmit={(e) => e.preventDefault()}>
  {/* UserName */}
  <InputGroup icon={<User size={18} />} placeholder="Username" type="text" />

  <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isLogin ? 
    "max-h-0 opacity-0" : "max-h-20 opacity-100 mt-4"}`}>
    <InputGroup icon={<Mail size={18} />} placeholder="Email Address" type="email" />
  </div>

  <InputGroup icon={<Lock size={18} />} placeholder="Password" type="password" />

  <div className={`flex justify-end transition-all duration-300 ${isLogin ? 'max-h-8 opacity-100 mt-2' : 'max-h-0 opacity-0 overflow-hidden'}`}>
    <button 
      type="button" 
      onClick={() => { 
        if(onClose) onClose();
        // Fallback for navigation if not handled by Link
        window.location.href = '/forgot-password';
      }} 
      className="text-xs text-gray-400 hover:text-white transition-colors"
    >
      Forgot Password?
    </button>
  </div>

  <button className='group relative w-full mt-6 py-4 bg-white text-black font-bold rounded-2xl overflow-hidden transition-all active:scale-[0.98]'>
    <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  <span className='relative z-10 flex items-center justify-center gap-2 
group-hover:text-white transition-colors'>
  {isLogin ? "Sign In" : "Create Account"}
  <ArrowRight size={18} className='transition-transform group-hover:translate-x-1' />
</span>
  
  </button>
</form>

<div className="flex items-center my-6 gap-4">
  <div className="h-px flex-1 bg-white/10">
  </div>
  <span className='text-gray-500 text-[10px] font-bold tracking-widest uppercase'>OR</span>
  <div className="h-px flex-1 bg-white/10">
  </div>
</div>

{/* Google Auth Button */}
<button className="flex items-center justify-center gap-3 w-full mb-6 py-3.5 bg-white text-black font-semibold rounded-2xl transition-all active:scale-[0.98] border border-gray-200 shadow-sm hover:bg-gray-50">
  <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
  Continue with Google
</button>

<footer className='mt-4 text-center text-sm'>
  <span className='text-gray-400'>
    {isLogin ? "New here?" : "Already have an account?"}
  </span>
  <button
    onClick={() => setIsLogin(!isLogin)}
    className='ml-2 text-white font-bold hover:text-purple-400 transition-colors
    cursor-pointer'
  >
    {isLogin ? "Create Account" : "Log In"}
  </button>
</footer>

</div>

</div>


        </div>


        </>
    )
}
const InputGroup = ({ icon, ...props }) => (
  <div className='flex items-center gap-3 px-4 py-4 bg-[#0a0a0a] rounded-2xl border border-white/5 
  focus-within:border-white/20 focus-within:ring-1 ring-white/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.
  4)] group'>
    <div className='text-gray-500 group-focus-within:text-white transition-colors'>{icon}</div>
    <input {...props} className='bg-transparent border-none outline-none w-full text-white placeholder-gray-600 
    text-sm' />
  </div>
)


export default AuthModal
