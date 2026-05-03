import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CreditCard, ChevronDown, ArrowLeft, AlertCircle, CheckCircle2, Settings2, MessageSquare } from 'lucide-react';
import { useGetOrderDetails, useUpdateOrderStatus } from '../hooks/useOrders';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: order, isLoading } = useGetOrderDetails(id);
    const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();

    const [packaging, setPackaging] = useState("");
    const [weight, setWeight] = useState("");

    useEffect(() => {
        if (order) {
            setPackaging(order.packaging || "");
            setWeight(order.weight ? order.weight.toString() : "");
        }
    }, [order]);

    const handleConfirmOrder = () => {
        if (window.confirm("Confirm this order? The customer will be notified.")) {
            updateOrderStatus({ id, status: 'confirmed' });
        }
    };

    const handleCancelOrder = () => {
        if (window.confirm("Cancel this order? This cannot be undone.")) {
            updateOrderStatus({ id, status: 'cancelled' });
        }
    };

    const handleMarkPackaged = () => {
        updateOrderStatus({ id, status: 'packaged', packaging, weight: Number(weight) });
    };

    const handleMarkShipped = () => {
        if (window.confirm("Mark as shipped? Ensure the courier has picked up the package.")) {
            updateOrderStatus({ id, status: 'shipped' });
        }
    };

    const colors = { primary: "#945305", bg: "#fdfbf9", cardBg: "#ffffff", textMain: "#1a1a1a", textMuted: "#6b7280" };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#945305]"></div></div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-500">Order not found.</div>;

    const isProcessing = order.orderStatus === 'processing';
    const isConfirmed = order.orderStatus === 'confirmed';
    const isPackaged = order.orderStatus === 'packaged';
    const isLocked = !isProcessing && !isConfirmed;

    // 👉 Filter out custom items to display their snapshot
    const customItems = (order.orderItems || []).filter(item => item.type === 'custom');
    const hasCustomItems = customItems.length > 0;

    return (
        <div className="min-h-screen p-4 md:p-12 font-sans selection:bg-orange-100" style={{ backgroundColor: colors.bg }}>
            <div className="max-w-6xl mx-auto">
                <header className="mb-8">
                    <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#945305] transition-colors mb-4 cursor-pointer">
                        <ArrowLeft size={16} /> Back to Orders
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-serif text-gray-900">Order #{order._id.slice(-6).toUpperCase()}</h1>
                                {hasCustomItems && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#fcead7] text-[#c27823] text-xs font-bold uppercase tracking-wider">
                                        <Settings2 size={14} /> Custom
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</p>
                        </div>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-orange-100 text-orange-800 border border-orange-200 shadow-sm">
                            {order.orderStatus.replace('_', ' ')}
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items Table */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-serif mb-6">Order Items</h2>
                                <div className="overflow-x-auto overflow-y-auto max-h-[350px] custom-scrollbar border border-gray-50 rounded-lg">
                                    <table className="w-full text-left relative">
                                        <thead className="sticky top-0 bg-white z-10 shadow-sm">
                                            <tr className="text-[10px] uppercase tracking-wider text-gray-400 border-b border-gray-100">
                                                <th className="py-4 px-4 font-medium">Product</th>
                                                <th className="py-4 px-4 font-medium text-center">Quantity</th>
                                                <th className="py-4 px-4 font-medium text-right">Unit Price</th>
                                                <th className="py-4 px-4 font-medium text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(order.orderItems || []).map((item) => (
                                                <tr key={item._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-4">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover bg-gray-100 border border-gray-200" />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                                    <Package size={20} className="text-gray-400" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-medium text-gray-900 leading-tight">{item.name}</h3>
                                                                {item.type === 'custom' && <span className="text-[10px] text-[#945305] font-bold mt-1 uppercase tracking-widest block">Bespoke Creation</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-sm text-gray-600">{item.quantity}</td>
                                                    <td className="py-4 px-4 text-right text-sm text-gray-600">₹{(item.price || 0).toFixed(2)}</td>
                                                    <td className="py-4 px-4 text-right font-medium text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {(order.orderItems?.length === 0) && (
                                                <tr><td colSpan="4" className="py-8 text-center text-gray-400 text-sm">No items found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 👉 DYNAMIC CUSTOM SELECTIONS (Using item.snapshot) */}
                                {hasCustomItems && (
                                    <div className="mt-8 pt-8 border-t border-gray-100">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Settings2 size={18} className="text-[#945305]" />
                                            <h3 className="font-serif text-lg text-gray-900">Custom Selections</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {customItems.map((item, index) => {
                                                const snap = item.snapshot || {};
                                                return (
                                                    <div key={item._id} className="bg-orange-50/40 border border-orange-100/60 p-5 rounded-xl">
                                                        <h4 className="font-bold text-sm text-gray-900 mb-4 border-b border-orange-100 pb-3 flex items-center justify-between">
                                                            <span>{item.name} <span className="text-gray-500 font-normal ml-1">(Qty: {item.quantity})</span></span>
                                                            <span className="text-xs bg-white border border-orange-100 text-[#945305] px-2 py-1 rounded">Item {index + 1}</span>
                                                        </h4>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                                                            {/* Vessel */}
                                                            {(snap.vesselName || snap.colorName) && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Vessel / Base</span>
                                                                    <span className="font-medium text-gray-900 text-sm">{snap.vesselName || snap.colorName}</span>
                                                                </div>
                                                            )}

                                                            {/* Scent */}
                                                            {snap.scentName && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-1 font-bold">Fragrance</span>
                                                                    <span className="font-medium text-gray-900 text-sm">{snap.scentName}</span>
                                                                </div>
                                                            )}

                                                            {/* Add Ons (Array mapping) */}
                                                            {snap.addOnNames && snap.addOnNames.length > 0 && (
                                                                <div className="flex flex-col sm:col-span-2 border-t border-orange-100/50 pt-3 mt-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold">Add-Ons & Toppings</span>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {snap.addOnNames.map((addon, idx) => (
                                                                            <span key={idx} className="bg-white border border-orange-200 text-gray-700 text-xs px-2.5 py-1 rounded-full shadow-sm">
                                                                                {addon}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Special Instructions (Only shows for Custom Candles) */}
                                                            {(snap.message) && (
                                                                <div className="flex flex-col sm:col-span-2 border-t border-orange-100/50 pt-3 mt-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 font-bold flex items-center gap-1">
                                                                        <MessageSquare size={12} /> Special Instructions
                                                                    </span>
                                                                    <p className="font-medium text-gray-800 text-sm italic bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                                                                        "{snap.message}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {/* Fallback if snapshot is empty */}
                                                            {Object.keys(snap).length === 0 && (
                                                                <span className="text-sm text-gray-500 italic col-span-2">No configuration details found for this item.</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fulfillment Card */}
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-[#945305]">
                                        <Package size={18} />
                                        <h3 className="font-serif text-lg text-gray-900">Fulfillment & Logistics</h3>
                                    </div>
                                    {isLocked && !isPackaged && <span className="text-xs text-gray-400 italic">Locked ({order.orderStatus})</span>}
                                </div>

                                {/* STEP 1: PROCESSING */}
                                {isProcessing && (
                                    <div className="bg-orange-50 border border-orange-100 rounded-lg p-5">
                                        <div className="flex gap-3 text-orange-800 mb-5">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-sm mb-1">Verification Required</p>
                                                <p className="text-sm opacity-90">Verify customer details. Confirming the order will notify the customer and prepare it for packing.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={handleConfirmOrder} disabled={isUpdating} className="px-5 py-2.5 bg-[#945305] text-white text-sm font-medium rounded-md hover:bg-[#7a4404] transition-colors disabled:opacity-50 cursor-pointer shadow-sm">
                                                {isUpdating ? 'Updating...' : 'Confirm Order'}
                                            </button>
                                            <button onClick={handleCancelOrder} disabled={isUpdating} className="px-5 py-2.5 border border-red-200 text-red-600 bg-white text-sm font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
                                                Cancel Order
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2 & 3: CONFIRMED OR LATER (Show Inputs) */}
                                {!isProcessing && (
                                    <>
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Packaging</label>
                                                <div className="relative group">
                                                    <select
                                                        value={packaging}
                                                        onChange={(e) => setPackaging(e.target.value)}
                                                        disabled={isLocked || isUpdating}
                                                        className="w-full appearance-none bg-transparent border border-gray-200 rounded-md py-3 px-4 text-sm text-gray-700 outline-none transition-all focus:border-[#945305] focus:ring-1 focus:ring-[#945305] disabled:bg-gray-50 disabled:text-gray-400 capitalize"
                                                    >
                                                        <option value="">Select size</option>
                                                        <option value="small">Small</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="large">Large</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase tracking-widest text-gray-400 block mb-2">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0" step="0.01"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    disabled={isLocked || isUpdating}
                                                    placeholder="0.00 kg"
                                                    className="w-full bg-transparent border border-gray-200 rounded-md py-3 px-4 text-sm text-gray-700 placeholder:text-gray-300 outline-none transition-all focus:border-[#945305] focus:ring-1 focus:ring-[#945305] disabled:bg-gray-50 disabled:text-gray-400"
                                                />
                                            </div>
                                        </div>

                                        {/* State: Confirmed -> Ready to Pack */}
                                        {isConfirmed && (
                                            <div className="mt-6 pt-6 border-t border-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <button onClick={handleCancelOrder} disabled={isUpdating} className="text-red-500 text-sm font-medium hover:text-red-700 disabled:opacity-50 cursor-pointer">
                                                    Cancel Order
                                                </button>
                                                <button
                                                    onClick={handleMarkPackaged}
                                                    disabled={isUpdating || !packaging || !weight}
                                                    className="px-6 py-2.5 bg-[#945305] text-white text-sm font-medium rounded-md hover:bg-[#7a4404] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save & Mark Packaged'}
                                                </button>
                                            </div>
                                        )}

                                        {/* State: Packaged -> Ready to Ship */}
                                        {isPackaged && (
                                            <div className="mt-6 pt-6 border-t border-gray-50 bg-[#fdfbf9] -mx-6 -mb-6 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                                    <CheckCircle2 size={18} />
                                                    Order is packed and ready for dispatch.
                                                </div>
                                                <button
                                                    onClick={handleMarkShipped}
                                                    disabled={isUpdating}
                                                    className="px-6 py-2.5 bg-[#945305] text-white text-sm font-medium rounded-md hover:bg-[#7a4404] transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
                                                >
                                                    {isUpdating ? 'Updating...' : 'Dispatch / Mark Shipped'}
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-[#945305]">
                                <Truck size={18} />
                                <h3 className="font-serif text-lg text-gray-900">Shipping Address</h3>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600 leading-relaxed">
                                <p className="font-bold text-gray-900 mb-1">{(order.user?.firstName + ' ' + order.user?.lastName) || 'Guest User'}</p>
                                <p>{order.shippingAddress?.address /* Adjusted based on schema */}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                                <p className="pt-2 text-gray-900">📞 {order.user?.phoneNumber}</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-6 text-[#945305]">
                                <CreditCard size={18} />
                                <h3 className="font-serif text-lg text-gray-900">Payment Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-2">Payment Mode</p>
                                    <div className="flex items-center gap-3 text-sm font-bold text-[#945305] uppercase">
                                        {order.paymentMethod || 'N/A'}
                                        {order.paymentStatus && (
                                            <span className={`px-2 py-0.5 text-[10px] rounded-full text-white ml-1 ${order.paymentStatus === 'paid' ? 'bg-green-500' : 'bg-orange-400'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900 font-medium">₹{(order.itemsPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Shipping</span>
                                        <span className="text-gray-900 font-medium">₹{(order.shippingPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Tax</span>
                                        <span className="text-gray-900 font-medium">₹{(order.taxPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-gray-50 flex justify-between">
                                        <span className="text-base text-gray-900 font-medium">Total</span>
                                        <span className="text-lg font-bold text-[#945305]">₹{(order.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;