import React, { useRef, useEffect } from 'react';
import PageBanner from '../components/ui/PageBanner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import MainBtn from '../components/ui/Buttons/MainBtn';

gsap.registerPlugin(ScrollTrigger);

const MyAccount = () => {
    const accountRef = useRef();

    useEffect(() => {
        if (!accountRef.current) return;
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
    }, []);

    return (
        <>
            <PageBanner title="My Account" currentPage="My Account" />
            <div ref={accountRef} className="container mx-auto py-[8%] px-4 account-section">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="col-span-1 space-y-4 account-card">
                        <div className="bg-gray-50 p-6 border border-gray-200">
                            <h3 className="text-xl font-semibold mb-4 text-heading">Welcome, User!</h3>
                            <p className="text-paragraph mb-6 text-sm">Manage your account details and track your orders.</p>
                            <ul className="space-y-4">
                                <li><a href="/account" className="font-medium text-black border-l-2 border-black pl-3 block">Dashboard</a></li>
                                <li><a href="/orders" className="text-paragraph hover:text-black transition-colors block pl-3">Orders</a></li>
                                <li><a href="/wishlist" className="text-paragraph hover:text-black transition-colors block pl-3">Wishlist</a></li>
                                <li className="pt-4 border-t border-gray-200">
                                    <button className="text-paragraph hover:text-black transition-colors block pl-3">Logout</button>
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
                                        <p className="font-medium text-heading">John Doe</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-paragraph mb-1">Email Address</p>
                                        <p className="font-medium text-heading">user@example.com</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-paragraph mb-1">Phone Number</p>
                                        <p className="font-medium text-heading">+1 234 567 890</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8">
                                <MainBtn type="button" text="Edit Profile" className="bg-primary! text-white! rounded-sm! shadow-none!" />
                            </div>
                        </div>

                        <div className="bg-white p-8 border border-gray-200 account-card shadow-sm">
                            <h4 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-3 text-heading">Default Address</h4>
                            <address className="text-paragraph not-italic space-y-2">
                                <p className="font-medium text-heading">John Doe</p>
                                <p>123 Candle Street, Suite 100</p>
                                <p>New York, NY 10001</p>
                                <p>United States</p>
                            </address>
                            <div className="mt-8">
                                <MainBtn type="button" text="Edit Address" className="bg-transparent! border! border-gray-200! text-black! rounded-sm! shadow-none! hover:bg-gray-50!" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MyAccount;
