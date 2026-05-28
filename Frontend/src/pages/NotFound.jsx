import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    const navigate = useNavigate();

    return (<>
    <SEO
      title="404 - Page Not Found - Naisha Creations"
      description="The page you are looking for might have been removed, had its name changed, or is temporarily unavailable."
    />
        <div className="min-h-[75vh] flex flex-col items-center justify-center bg-stone-50 px-4 text-center py-20">
            {/* Massive subtle background text */}
            <h1 className="text-9xl md:text-[12rem] font-light text-stone-200 select-none tracking-tighter">
                404
            </h1>

            {/* Foreground Content */}
            <div className="-mt-12 md:-mt-16 relative z-10">
                <h2 className="text-3xl md:text-4xl font-semibold text-stone-900 tracking-tight">
                    Looks like you're lost.
                </h2>
                <p className="mt-4 text-stone-500 max-w-md mx-auto leading-relaxed">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable. Let's get you back on track.
                </p>

                {/* Action Buttons */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 border border-stone-300 text-stone-600 hover:bg-stone-100 hover:text-stone-900 rounded-full transition-colors font-medium cursor-pointer"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <Link
                        to="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 text-white hover:bg-stone-800 rounded-full transition-colors font-medium shadow-sm cursor-pointer"
                    >
                        <Home size={18} />
                        Back to Home
                    </Link>
                </div>

                {/* Helpful Links */}
                <div className="mt-16 pt-8 border-t border-stone-200">
                    <p className="text-sm text-stone-500 mb-4">Or try one of these popular links:</p>
                    <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
                        <Link to="/collections" className="text-[#D19D94] hover:text-stone-900 transition-colors">
                            Shop Collections
                        </Link>
                        <span className="text-stone-300">•</span>
                        <Link to="/custom-candle" className="text-[#D19D94] hover:text-stone-900 transition-colors">
                            Customise a Candle
                        </Link>
                        <span className="text-stone-300">•</span>
                        <Link to="/contact" className="text-[#D19D94] hover:text-stone-900 transition-colors">
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default NotFound;