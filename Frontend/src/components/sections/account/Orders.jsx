import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import MainBtn from '../../ui/Buttons/MainBtn';
import { Loader2 } from 'lucide-react';

// Import your custom hook
import { useOrders } from '../../../hooks/useOrders';

gsap.registerPlugin(ScrollTrigger);

const Orders = () => {
    const ordersRef = useRef();

    // Fetch dynamic orders data
    const { data: dbOrders, isLoading } = useOrders();

    // Logic: Map backend MongoDB data to match your UI structure perfectly
    const orders = dbOrders?.map(order => ({
        id: `#ORD-${order._id.slice(-6).toUpperCase()}`, // Use last 6 chars of MongoDB ID
        rawId: order._id, // Keep the real ID for linking to order details later
        date: new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        }),
        // Capitalize status and replace underscores (e.g., 'out_for_delivery' -> 'Out for delivery')
        status: order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1).replace(/_/g, ' '),
        total: `₹${order.totalAmount}`,
        items: order.orderItems.reduce((acc, item) => acc + item.quantity, 0) // Count total items
    })) || [];

    // GSAP Animation Logic
    useEffect(() => {
        // Wait until data is loaded so DOM elements exist before animating
        if (isLoading || !ordersRef.current) return;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(ordersRef);

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
    }, [isLoading, orders.length]); // Re-run when loading finishes

    // Loading State
    if (isLoading) {
        return (
            <>
                <div className="h-[50vh] flex items-center justify-center">
                    <Loader2 className="animate-spin text-gray-400" size={48} />
                </div>
            </>
        );
    }

    return (
        <>
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
                                                {/* Dynamic Status Styling based on backend values */}
                                                <span className={`px-3 py-1 text-xs rounded-sm ${order.status.toLowerCase() === 'delivered'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : order.status.toLowerCase() === 'cancelled'
                                                            ? 'bg-red-50 text-red-700 border border-red-200'
                                                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="text-sm font-semibold underline text-heading hover:text-coffee transition-colors cursor-pointer">
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
                                        <span className={`px-3 py-1 text-xs rounded-sm ${order.status.toLowerCase() === 'delivered'
                                                ? 'bg-green-50 text-green-700 border border-green-200'
                                                : order.status.toLowerCase() === 'cancelled'
                                                    ? 'bg-red-50 text-red-700 border border-red-200'
                                                    : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                            }`}>
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