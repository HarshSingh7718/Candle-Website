import React, { useRef, useEffect } from 'react';
import PageBanner from '../components/ui/PageBanner';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import MainBtn from '../components/ui/Buttons/MainBtn';

gsap.registerPlugin(ScrollTrigger);

const Orders = () => {
    const ordersRef = useRef();

    // Mock data for orders matching the theme
    const orders = [
        { id: "#ORD-1001", date: "Oct 12, 2026", status: "Delivered", total: "$120.00", items: 3 },
        { id: "#ORD-1002", date: "Oct 15, 2026", status: "Processing", total: "$45.00", items: 1 },
    ];

    useEffect(() => {
        if (!ordersRef.current) return;
        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(ordersRef);
            
            // Reusing animation style from wishlist
            gsap.from(q(".order-item"), {
                y: 55,
                opacity: 0,
                duration: 0.6,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".orders-section"),
                    start: "top 85%",
                    toggleActions: "play none none reverse",
                },
            });

            gsap.from(q(".orders-head"), {
                y: -40,
                opacity: 0,
                duration: 0.5,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".orders-section"),
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                },
            });

            gsap.from(q(".orders-th"), {
                x: -30,
                opacity: 0,
                duration: 0.4,
                stagger: 0.15,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: q(".orders-head"),
                    start: "top 90%",
                    toggleActions: "play none none reverse",
                },
            });
        }, ordersRef);
        return () => ctx.revert();
    }, []);

    return (
        <>
            <PageBanner title="My Orders" currentPage="Orders" />
            <div ref={ordersRef} className="container mx-auto py-[8%] px-4 orders-section">
                
                {orders.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 border border-gray-200 order-item">
                        <p className="text-lg text-paragraph mb-6">You haven't placed any orders yet.</p>
                        <Link to="/collections">
                            <MainBtn type="button" text="Start Shopping" className="bg-primary! text-white! rounded-sm! shadow-none!" />
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-black text-white orders-head">
                                    <tr>
                                        <th className="p-4 text-left font-medium orders-th">Order ID</th>
                                        <th className="p-4 text-left font-medium orders-th">Date</th>
                                        <th className="p-4 text-left font-medium orders-th">Items</th>
                                        <th className="p-4 text-left font-medium orders-th">Total</th>
                                        <th className="p-4 text-left font-medium orders-th">Status</th>
                                        <th className="p-4 text-center font-medium orders-th">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order, idx) => (
                                        <tr key={idx} className="border-b border-gray-200 order-item">
                                            <td className="p-4 font-semibold text-heading border-r border-gray-200">{order.id}</td>
                                            <td className="p-4 text-paragraph border-r border-gray-200">{order.date}</td>
                                            <td className="p-4 text-paragraph border-r border-gray-200">{order.items} items</td>
                                            <td className="p-4 text-heading font-medium border-r border-gray-200">{order.total}</td>
                                            <td className="p-4 border-r border-gray-200">
                                                <span className={`px-3 py-1 text-xs rounded-sm ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="text-sm font-semibold underline text-heading hover:text-coffee transition-colors">
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile View */}
                        <div className="lg:hidden space-y-6">
                            {orders.map((order, idx) => (
                                <div key={idx} className="border border-gray-200 p-4 rounded-sm order-item bg-white">
                                    <div className="flex justify-between items-center mb-3 pb-3 border-b border-gray-100">
                                        <span className="font-semibold text-heading">{order.id}</span>
                                        <span className={`px-3 py-1 text-xs rounded-sm ${order.status === 'Delivered' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="space-y-3 text-sm text-paragraph mb-5">
                                        <div className="flex justify-between">
                                            <span>Date:</span>
                                            <span className="text-heading font-medium">{order.date}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Items:</span>
                                            <span className="text-heading font-medium">{order.items}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Total:</span>
                                            <span className="text-heading font-medium">{order.total}</span>
                                        </div>
                                    </div>
                                    <MainBtn type="button" text="View Details" className="w-full! bg-transparent! border! border-gray-200! shadow-none! rounded-sm! text-black! py-3!" />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default Orders;
