import React, { useRef, useEffect, useMemo } from 'react';
import gsap from 'gsap';
import { Link, useNavigate } from 'react-router-dom';
import MainBtn from '../../ui/Buttons/MainBtn';
import { Loader2 } from 'lucide-react';

// Import your custom hook
import { useOrders } from '../../../hooks/useOrders';

// 👉 1. PURE HELPER FUNCTION AT THE TOP
// This handles all data transformation cleanly outside the React render cycle
const formatOrderData = (dbOrders) => {
    if (!dbOrders || dbOrders.length === 0) return [];

    return dbOrders.map(order => ({
        id: order.orderId,
        rawId: order._id,
        date: new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: '2-digit', year: 'numeric'
        }),
        status: order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1).replace(/_/g, ' '),
        total: `₹${(order.totalAmount || 0).toFixed(2)}`,
        items: order.orderItems?.reduce((acc, item) => acc + (item.quantity || 1), 0) || 0
    }));
};

const Orders = () => {
    const ordersRef = useRef();
    const navigate = useNavigate();

    // Fetch dynamic orders data
    const { data: dbOrders, isLoading } = useOrders();

    // 👉 2. USE MEMO FOR PERFORMANCE
    // This guarantees the mapping logic only runs once when the backend data arrives
    const orders = useMemo(() => formatOrderData(dbOrders), [dbOrders]);

    // GSAP Animation Logic 
    useEffect(() => {
        if (isLoading || !ordersRef.current) return;

        const ctx = gsap.context(() => {
            const q = gsap.utils.selector(ordersRef);

            gsap.fromTo(q(".orders-head"),
                { y: -40, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" }
            );

            gsap.fromTo(q(".orders-th"),
                { x: -30, opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: "power3.out", delay: 0.2 }
            );

            gsap.fromTo(q(".order-item"),
                { y: 55, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out", delay: 0.3 }
            );
        }, ordersRef);

        return () => ctx.revert();
    }, [isLoading, orders.length]);

    // Loading State
    if (isLoading) {
        return (
            <div className="h-[50vh] flex items-center justify-center">
                <Loader2 className="animate-spin text-text-disabled" size={48} />
            </div>
        );
    }

    return (
        <div ref={ordersRef} className="container mx-auto py-[8%] px-4 orders-section">

            {orders.length === 0 ? (
                <div className="text-center py-10 bg-bg-surface-hover border border-bg-muted order-item">
                    <p className="text-lg text-paragraph mb-6">You haven't placed any orders yet.</p>
                    <Link to="/collections">
                        <MainBtn type="button" text="Start Shopping" className="bg-primary! text-white! rounded-sm! shadow-none!" />
                    </Link>
                </div>
            ) : (
                <>
                    {/* Desktop Table */}
                    <div className="hidden lg:flex flex-col gap-4">
                        {orders.map((order, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/account/orders/${order.id}`)}
                                className="order-item opacity-0 bg-bg-surface border border-bg-muted rounded-lg p-5 cursor-pointer hover:border-primary/30 hover:shadow-md transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="font-semibold text-heading">
                                            {order.id}
                                        </h3>
                                        <p className="text-sm text-paragraph mt-1">
                                            {order.date}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-12">
                                        <div>
                                            <p className="text-xs text-paragraph uppercase tracking-wide">
                                                Items
                                            </p>
                                            <p className="font-medium text-heading">
                                                {order.items}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-paragraph uppercase tracking-wide">
                                                Total
                                            </p>
                                            <p className="font-semibold text-heading">
                                                {order.total}
                                            </p>
                                        </div>

                                        <span
                                            className={`px-3 py-1 text-xs rounded-full ${order.status.toLowerCase() === "delivered"
                                                ? "bg-green-50 text-green-700"
                                                : order.status.toLowerCase() === "cancelled"
                                                    ? "bg-red-50 text-red-700"
                                                    : "bg-yellow-50 text-yellow-700"
                                                }`}
                                        >
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden space-y-6">
                        {orders.map((order, idx) => (
                            <div
                                key={idx}
                                onClick={() => navigate(`/account/orders/${order.id}`)}
                                className="border border-bg-muted p-4 rounded-sm order-item opacity-0 bg-bg-surface cursor-pointer active:scale-[0.99] hover:border-gray-300 transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex justify-between items-center mb-3 pb-3 border-b border-bg-muted">
                                    <span className="font-semibold text-heading">{order.id}</span>
                                    <span className={`px-3 py-1 text-xs rounded-sm ${order.status.toLowerCase() === 'delivered'
                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                        : order.status.toLowerCase() === 'cancelled'
                                            ? 'bg-red-50 text-red-700 border border-danger/30'
                                            : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                                        }`}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="space-y-3 text-sm text-paragraph">
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
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Orders;