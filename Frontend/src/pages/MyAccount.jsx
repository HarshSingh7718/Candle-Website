import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Upgraded 'a' tags to 'Link' to prevent full page reloads
import PageBanner from '../components/ui/PageBanner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MainBtn from '../components/ui/Buttons/MainBtn';
import { Loader2 } from 'lucide-react';

// Import your custom hook
import { useUser, useLogout } from '../hooks/useAuth';

gsap.registerPlugin(ScrollTrigger);

const MyAccount = () => {
    const accountRef = useRef();

    // Fetch dynamic user data
    const { data: user, isLoading } = useUser();
    const logoutMutation = useLogout();

    // GSAP Animation logic
    useEffect(() => {
        // LOGIC FIX: Don't run GSAP until the data is loaded and DOM is ready
        if (isLoading || !accountRef.current) return;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(accountRef);
            gsap.from(q(".account-card"), {
                y: 50,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".account-section"),
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });
        }, accountRef);
        return () => ctx.revert();
    }, [isLoading]); // Re-run when loading state changes

    // Loading state UI (matches your ShopDetails loader)
    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-400" size={48} />
            </div>
        );
    }

    // Logic: Find the default address, or fallback to the first one available
    const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

    return (
        <>
            <PageBanner title="My Account" currentPage="My Account" />
            <div ref={accountRef} className="container mx-auto py-[8%] px-4 account-section">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="col-span-1 space-y-4 account-card">
                        <div className="bg-gray-50 p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold mb-4 text-heading">
                                Welcome, {user?.firstName}!
                            </h3>
                            <p className="text-paragraph mb-6 text-sm">Manage your account details and track your orders.</p>
                            <ul className="space-y-4">
                                <li><Link to="/account" className="font-medium text-black border-l-2 border-black pl-3 block">Dashboard</Link></li>
                                <li><Link to="/orders" className="text-paragraph hover:text-black transition-colors block pl-3">Orders</Link></li>
                                <li><Link to="/wishlist" className="text-paragraph hover:text-black transition-colors block pl-3">Wishlist</Link></li>
                                <li className="pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => logoutMutation.mutate()}
                                        className="text-paragraph hover:text-black transition-colors block pl-3 cursor-pointer"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="col-span-1 md:col-span-3 space-y-8">
                        <div className="bg-white p-8 border border-gray-200 account-card shadow-sm">
                            <h4 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-3 text-heading">Account Details</h4>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-paragraph mb-1">Full Name</p>
                                        <p className="font-medium text-heading">{user?.firstName} {user?.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-paragraph mb-1">Email Address</p>
                                        <p className="font-medium text-heading">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-paragraph mb-1">Phone Number</p>
                                        <p className="font-medium text-heading">{user?.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <MainBtn type="button" text="Edit Profile" className="bg-primary! text-white! rounded-sm! shadow-none!" />
                            </div>
                        </div>

                        <div className="bg-white p-8 border border-gray-200 account-card shadow-sm">
                            <h4 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-3 text-heading">Default Address</h4>

                            {defaultAddress ? (
                                <address className="text-paragraph not-italic space-y-2">
                                    <p className="font-medium text-heading">{user?.firstName} {user?.lastName}</p>
                                    <p>{defaultAddress.address}</p>
                                    <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}</p>
                                    <p>{defaultAddress.phone && `Phone: ${defaultAddress.phone}`}</p>
                                </address>
                            ) : (
                                <p className="text-paragraph not-italic">No default address saved yet.</p>
                            )}

                            <div className="mt-8">
                                <MainBtn type="button" text={defaultAddress ? "Edit Address" : "Add Address"} className="bg-transparent! border! border-gray-200! text-black! rounded-sm! shadow-none! hover:bg-gray-50!" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyAccount;