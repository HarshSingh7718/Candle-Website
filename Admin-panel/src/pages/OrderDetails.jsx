import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Truck, CreditCard, ChevronDown, ArrowLeft, AlertCircle, CheckCircle2, Settings2, MessageSquare, ExternalLink, X, FileText, Download } from 'lucide-react';
import { useGetOrderDetails, useUpdateOrderStatus, useGetAvailableCouriers, useShipOrder } from '../hooks/useOrders';

const OrderDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: order, isLoading, isFetching } = useGetOrderDetails(id);
    const { mutate: updateOrderStatus, isPending: isUpdating } = useUpdateOrderStatus();
    const { mutate: shipOrder, isPending: isShipping } = useShipOrder();

    const [packaging, setPackaging] = useState("");
    const [weight, setWeight] = useState("");
    const [showCourierModal, setShowCourierModal] = useState(false);

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

    if (isLoading) return (
        <div className="min-h-screen p-4 md:p-12 font-sans">
            <div className="max-w-6xl mx-auto animate-pulse">
                <div className="h-4 w-24 bg-bg-muted rounded mb-4"></div>
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <div className="h-10 w-64 bg-bg-muted rounded mb-2"></div>
                        <div className="h-4 w-40 bg-bg-muted rounded"></div>
                    </div>
                    <div className="h-8 w-24 bg-bg-muted rounded-full"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-bg-surface rounded-xl border border-bg-muted"></div>
                        <div className="h-48 bg-bg-surface rounded-xl border border-bg-muted"></div>
                    </div>
                    <div className="space-y-6">
                        <div className="h-48 bg-bg-surface rounded-xl border border-bg-muted"></div>
                        <div className="h-64 bg-bg-surface rounded-xl border border-bg-muted"></div>
                    </div>
                </div>
            </div>
        </div>
    );
    if (!order) return <div className="min-h-screen flex items-center justify-center text-text-muted">Order not found.</div>;

    const isProcessing = order.orderStatus === 'processing';
    const isConfirmed = order.orderStatus === 'confirmed';
    const isPackaged = order.orderStatus === 'packaged';
    const isShipped = order.orderStatus === 'shipped';
    const isDelivered = order.orderStatus === 'delivered';
    const isLocked = !isProcessing && !isConfirmed;
    const hasShiprocketData = !!order.shiprocketOrderId || !!order.awbCode;

    // 👉 Filter out custom items to display their snapshot
    const customItems = (order.orderItems || []).filter(item => item.type === 'custom');
    const hasCustomItems = customItems.length > 0;

    return (
        <div className="min-h-screen p-4 md:p-12 font-sans selection:bg-warning/10" >
            <div className={`max-w-6xl mx-auto transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <header className="mb-8">
                    <button onClick={() => navigate('/orders')} className="flex items-center gap-2 text-sm text-text-muted hover:text-brand-primary transition-colors mb-4 cursor-pointer">
                        <ArrowLeft size={16} /> Back to Orders
                    </button>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-serif text-text-base">Order #{order.orderId}</h1>
                                {hasCustomItems && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-warning/10 text-warning text-xs font-bold uppercase tracking-wider">
                                        <Settings2 size={14} /> Custom
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-text-muted">Placed on {new Date(order.createdAt).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest bg-warning/10 text-warning border border-warning/20 shadow-sm">
                            {order.orderStatus.replace('_', ' ')}
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Order Items Table */}
                        <div className="bg-bg-surface rounded-xl border border-bg-muted shadow-sm overflow-hidden">
                            <div className="p-6">
                                <h2 className="text-xl font-serif mb-6">Order Items</h2>
                                <div className="overflow-x-auto overflow-y-auto max-h-[350px] custom-scrollbar border border-bg-muted rounded-lg">
                                    <table className="w-full text-left relative">
                                        <thead className="sticky top-0 bg-bg-surface z-10 shadow-sm">
                                            <tr className="text-[10px] uppercase tracking-wider text-text-disabled border-b border-bg-muted">
                                                <th className="py-4 px-4 font-medium">Product</th>
                                                <th className="py-4 px-4 font-medium text-center">Quantity</th>
                                                <th className="py-4 px-4 font-medium text-right">Unit Price</th>
                                                <th className="py-4 px-4 font-medium text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-bg-muted">
                                            {(order.orderItems || []).map((item) => (
                                                <tr key={item._id} className="hover:bg-bg-canvas/50 transition-colors">
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-4">
                                                            {item.image ? (
                                                                <img src={item.image} alt={item.name} className="w-14 h-14 rounded-md object-cover bg-bg-muted border border-bg-muted" />
                                                            ) : (
                                                                <div className="w-14 h-14 rounded-md bg-bg-muted border border-bg-muted flex items-center justify-center">
                                                                    <Package size={20} className="text-text-disabled" />
                                                                </div>
                                                            )}
                                                            <div>
                                                                <h3 className="font-medium text-text-base leading-tight">{item.name}</h3>
                                                                {item.type === 'custom' && <span className="text-[10px] text-brand-primary font-bold mt-1 uppercase tracking-widest block">Bespoke Creation</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 text-center text-sm text-text-muted">{item.quantity}</td>
                                                    <td className="py-4 px-4 text-right text-sm text-text-muted">₹{(item.price || 0).toFixed(2)}</td>
                                                    <td className="py-4 px-4 text-right font-medium text-text-base">₹{(item.price * item.quantity).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            {(order.orderItems?.length === 0) && (
                                                <tr><td colSpan="4" className="py-8 text-center text-text-disabled text-sm">No items found.</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* 👉 DYNAMIC CUSTOM SELECTIONS (Using item.snapshot) */}
                                {hasCustomItems && (
                                    <div className="mt-8 pt-8 border-t border-bg-muted">
                                        <div className="flex items-center gap-2 mb-6">
                                            <Settings2 size={18} className="text-brand-primary" />
                                            <h3 className="font-serif text-lg text-text-base">Custom Selections</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-6">
                                            {customItems.map((item, index) => {
                                                const snap = item.snapshot || {};
                                                return (
                                                    <div key={item._id} className="bg-warning/10/40 border border-warning/20/60 p-5 rounded-xl">
                                                        <h4 className="font-bold text-sm text-text-base mb-4 border-b border-warning/20 pb-3 flex items-center justify-between">
                                                            <span>{item.name} <span className="text-text-muted font-normal ml-1">(Qty: {item.quantity})</span></span>
                                                            <span className="text-xs bg-bg-surface border border-warning/20 text-brand-primary px-2 py-1 rounded">Item {index + 1}</span>
                                                        </h4>

                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                                                            {/* Vessel */}
                                                            {(snap.vesselName || snap.colorName) && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-bold">Vessel / Base</span>
                                                                    <span className="font-medium text-text-base text-sm">{snap.vesselName || snap.colorName}</span>
                                                                </div>
                                                            )}

                                                            {/* Scent */}
                                                            {snap.scentName && (
                                                                <div className="flex flex-col">
                                                                    <span className="text-[10px] uppercase tracking-widest text-text-muted mb-1 font-bold">Fragrance</span>
                                                                    <span className="font-medium text-text-base text-sm">{snap.scentName}</span>
                                                                </div>
                                                            )}

                                                            {/* Add Ons (Array mapping) */}
                                                            {snap.addOnNames && snap.addOnNames.length > 0 && (
                                                                <div className="flex flex-col sm:col-span-2 border-t border-warning/20/50 pt-3 mt-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold">Add-Ons & Toppings</span>
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {snap.addOnNames.map((addOn, idx) => (
                                                                            <span key={idx} className="bg-bg-surface border border-warning/20 text-text-base text-xs px-2.5 py-1 rounded-full shadow-sm">
                                                                                {addOn}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}

                                                            {/* Special Instructions (Only shows for Custom Candles) */}
                                                            {(snap.message) && (
                                                                <div className="flex flex-col sm:col-span-2 border-t border-warning/20/50 pt-3 mt-1">
                                                                    <span className="text-[10px] uppercase tracking-widest text-text-muted mb-2 font-bold flex items-center gap-1">
                                                                        <MessageSquare size={12} /> Special Instructions
                                                                    </span>
                                                                    <p className="font-medium text-text-base text-sm italic bg-bg-surface p-3 rounded-lg border border-warning/20 shadow-sm">
                                                                        "{snap.message}"
                                                                    </p>
                                                                </div>
                                                            )}
                                                            {/* Fallback if snapshot is empty */}
                                                            {Object.keys(snap).length === 0 && (
                                                                <span className="text-sm text-text-muted italic col-span-2">No configuration details found for this item.</span>
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
                        <div className="bg-bg-surface rounded-xl border border-bg-muted shadow-sm overflow-hidden">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2 text-brand-primary">
                                        <Package size={18} />
                                        <h3 className="font-serif text-lg text-text-base">Fulfillment & Logistics</h3>
                                    </div>
                                    {isLocked && !isPackaged && <span className="text-xs text-text-disabled italic">Locked ({order.orderStatus})</span>}
                                </div>

                                {/* STEP 1: PROCESSING */}
                                {isProcessing && (
                                    <div className="bg-warning/10 border border-warning/20 rounded-lg p-5">
                                        <div className="flex gap-3 text-warning mb-5">
                                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                                            <div>
                                                <p className="font-bold text-sm mb-1">Verification Required</p>
                                                <p className="text-sm opacity-90">Verify customer details. Confirming the order will notify the customer and prepare it for packing.</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-3">
                                            <button onClick={handleConfirmOrder} disabled={isUpdating} className="px-5 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-coffee-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm">
                                                {isUpdating ? 'Updating...' : 'Confirm Order'}
                                            </button>
                                            <button onClick={handleCancelOrder} disabled={isUpdating} className="px-5 py-2.5 border border-danger/20 text-danger bg-bg-surface text-sm font-medium rounded-md hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer">
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
                                                <label className="text-[10px] uppercase tracking-widest text-text-disabled block mb-2">Packaging</label>
                                                <div className="relative group">
                                                    <select
                                                        value={packaging}
                                                        onChange={(e) => setPackaging(e.target.value)}
                                                        disabled={isLocked || isUpdating}
                                                        className="w-full appearance-none bg-transparent border border-bg-muted rounded-md py-3 px-4 text-sm text-text-base outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-bg-canvas disabled:text-text-disabled capitalize"
                                                    >
                                                        <option value="">Select size</option>
                                                        <option value="small">Small</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="large">Large</option>
                                                    </select>
                                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-text-disabled">
                                                        <ChevronDown size={16} />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1">
                                                <label className="text-[10px] uppercase tracking-widest text-text-disabled block mb-2">Weight (kg)</label>
                                                <input
                                                    type="number"
                                                    min="0" step="0.01"
                                                    value={weight}
                                                    onChange={(e) => setWeight(e.target.value)}
                                                    disabled={isLocked || isUpdating}
                                                    placeholder="0.00 kg"
                                                    className="w-full bg-transparent border border-bg-muted rounded-md py-3 px-4 text-sm text-text-base placeholder:text-text-disabled outline-none transition-all focus:border-brand-primary focus:ring-1 focus:ring-brand-primary disabled:bg-bg-canvas disabled:text-text-disabled"
                                                />
                                            </div>
                                        </div>

                                        {/* State: Confirmed -> Ready to Pack */}
                                        {isConfirmed && (
                                            <div className="mt-6 pt-6 border-t border-bg-muted flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <button onClick={handleCancelOrder} disabled={isUpdating} className="text-danger text-sm font-medium hover:text-red-700 disabled:opacity-50 cursor-pointer">
                                                    Cancel Order
                                                </button>
                                                <button
                                                    onClick={handleMarkPackaged}
                                                    disabled={isUpdating || !packaging || !weight}
                                                    className="px-6 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-coffee-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                                                >
                                                    {isUpdating ? 'Saving...' : 'Save & Mark Packaged'}
                                                </button>
                                            </div>
                                        )}

                                        {/* State: Packaged -> Ready to Ship */}
                                        {isPackaged && (
                                            <div className="mt-6 pt-6 border-t border-bg-muted bg-bg-canvas -mx-6 -mb-6 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                                                    <CheckCircle2 size={18} />
                                                    Order is packed and ready for dispatch.
                                                </div>
                                                {/* Only show manual ship button if Shiprocket didn't assign AWB */}
                                                {order.shiprocketOrderId && !order.awbCode && (
                                                    <button
                                                        onClick={() => setShowCourierModal(true)}
                                                        disabled={isUpdating || isShipping}
                                                        className="px-6 py-2.5 bg-brand-primary text-white text-sm font-medium rounded-md hover:bg-coffee-800 transition-colors disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-2"
                                                    >
                                                        <Truck size={16} />
                                                        {isShipping ? 'Initiating...' : 'Select Courier & Ship'}
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Shiprocket Info Card */}
                                        {hasShiprocketData && (isPackaged || isShipped || isDelivered) && (
                                            <div className="mt-6 pt-6 border-t border-bg-muted">
                                                <div className="bg-info/10 border border-info/20 rounded-lg p-5">
                                                    <a href={`https://app.shiprocket.in/seller/orders/details/${order.shiprocketOrderId}`} target="_blank" rel="noopener noreferrer">
                                                        <div className="flex items-center gap-2 mb-4 cursor-pointer hover:scale-102 transition-all duration-200">
                                                            <Truck size={18} className="text-info" />
                                                            <h4 className="font-bold text-sm text-info">Shiprocket Shipment</h4>
                                                            <ExternalLink size={16} className='text-info'/>
                                                        </div>
                                                    </a>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        {order.awbCode && (
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-1 font-bold">AWB Code</span>
                                                                <span className="font-mono font-bold text-sm text-text-base">{order.awbCode}</span>
                                                            </div>
                                                        )}
                                                        {order.courierName && (
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-1 font-bold">Courier</span>
                                                                <span className="font-medium text-sm text-text-base">{order.courierName}</span>
                                                            </div>
                                                        )}
                                                        {order.shiprocketOrderId && (
                                                            <div>
                                                                <span className="text-[10px] uppercase tracking-widest text-text-muted block mb-1 font-bold">Shiprocket Order ID</span>
                                                                <span className="font-mono text-sm text-text-base">{order.shiprocketOrderId}</span>
                                                            </div>
                                                        )}
                                                        {order.trackingUrl && (
                                                            <div>
                                                                <a
                                                                    href={order.trackingUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-info hover:text-info transition-colors mt-2"
                                                                >
                                                                    Track Shipment
                                                                </a>
                                                            </div>
                                                        )}
                                                        {order.labelUrl && !['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) && (
                                                            <div>
                                                                <a
                                                                    href={order.labelUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-info hover:text-info transition-colors mt-2"
                                                                >
                                                                    <Download size={14} /> Download Label
                                                                </a>
                                                            </div>
                                                        )}
                                                        {order.manifestUrl && !['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus) && (
                                                            <div>
                                                                <a
                                                                    href={order.manifestUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-info hover:text-info transition-colors mt-2"
                                                                >
                                                                    <FileText size={14} /> Download Manifest
                                                                </a>
                                                            </div>
                                                        )}
                                                        {order.invoiceUrl && (
                                                            <div>
                                                                <a
                                                                    href={order.invoiceUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-sm font-medium text-info hover:text-info transition-colors mt-2"
                                                                >
                                                                    <FileText size={14} /> Download Invoice
                                                                </a>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Payment & Summary */}
                    <div className="space-y-6">
                        <div className="bg-bg-surface rounded-xl border border-bg-muted shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-4 text-brand-primary">
                                <Truck size={18} />
                                <h3 className="font-serif text-lg text-text-base">Shipping Address</h3>
                            </div>
                            <div className="space-y-1 text-sm text-text-muted leading-relaxed">
                                <p className="font-bold text-text-base mb-1">{(order.shippingAddress?.firstName + ' ' + order.shippingAddress?.lastName) || 'Guest User'}</p>
                                <p>{order.shippingAddress?.address /* Adjusted based on schema */}</p>
                                <p>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}</p>
                                <p className="pt-2 text-text-base">📞 {order.shippingAddress?.phone}</p>
                            </div>
                        </div>

                        <div className="bg-bg-surface rounded-xl border border-bg-muted shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-6 text-brand-primary">
                                <CreditCard size={18} />
                                <h3 className="font-serif text-lg text-text-base">Payment Details</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest text-text-disabled mb-2">Payment Mode</p>
                                    <div className="flex items-center gap-3 text-sm font-bold text-brand-primary uppercase">
                                        {order.paymentMethod || 'N/A'}
                                        {order.paymentStatus && (
                                            <span className={`px-2 py-0.5 text-[10px] rounded-full text-white ml-1 ${order.paymentStatus === 'paid' ? 'bg-success text-text-on-brand' : 'bg-orange-400'}`}>
                                                {order.paymentStatus}
                                            </span>
                                        )}
                                    </div>
                                    {order.paymentId && 
                                    <a href={`https://dashboard.razorpay.com/app/payments/${order.paymentId}`} target="_blank" rel="noopener noreferrer">
                                    <button className="mt-4 hover:bg-transparent text-info hover:text-info text-sm md:text-md font-semibold flex items-center space-x-1 cursor-pointer hover:scale-102 transition-all duration-200">
                                        <span>View Payment Details</span>
                                        <ExternalLink size={14} />
                                    </button></a>
                                    }
                                        
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between text-sm text-text-muted">
                                        <span>Subtotal</span>
                                        <span className="text-text-base font-medium">₹{(order.itemsPrice || 0).toFixed(2)}</span>
                                    </div>
                                    {(order.discountAmount > 0 || order.discount > 0) && (
                                        <div className="flex justify-between text-sm text-success">
                                            <span>Discount</span>
                                            <span className="font-medium">-₹{((order.discountAmount || order.discount) || 0).toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm text-text-muted">
                                        <span>Shipping</span>
                                        <span className="text-text-base font-medium">₹{(order.shippingPrice || 0).toFixed(2)}</span>
                                    </div>
                                    <div className="pt-4 border-t border-bg-muted flex justify-between">
                                        <span className="text-base text-text-base font-medium">Total</span>
                                        <span className="text-lg font-bold text-brand-primary">₹{(order.totalAmount || 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <CourierModal 
                isOpen={showCourierModal} 
                onClose={() => setShowCourierModal(false)}
                orderId={order.orderId || order._id}
                onShip={(courierId, pickupDate) => {
                    shipOrder({ id: order.orderId || order._id, courierId, pickupDate });
                }}
                useGetAvailableCouriers={useGetAvailableCouriers}
            />
        </div>
    );
};

const CourierModal = ({ isOpen, onClose, orderId, onShip, useGetAvailableCouriers }) => {
    const { data: couriers, isLoading } = useGetAvailableCouriers(orderId, isOpen);
    const [selectedCourier, setSelectedCourier] = useState("");
    const [pickupDate, setPickupDate] = useState("");

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-bg-surface rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-bg-muted flex items-center justify-between bg-warning/10/50">
                    <h3 className="font-serif text-lg text-text-base">Select Courier</h3>
                    <button onClick={onClose} className="text-text-disabled hover:text-text-muted transition-colors cursor-pointer">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mb-4"></div>
                            <p className="text-sm text-text-muted">Searching for available couriers...</p>
                        </div>
                    ) : couriers && couriers.length > 0 ? (
                        <div className="space-y-4">
                            <div className="mb-6">
                                <label className="text-xs uppercase tracking-wider text-text-muted font-bold mb-2 block">Pickup Date</label>
                                <input 
                                    type="date" 
                                    min={new Date().toISOString().split('T')[0]}
                                    value={pickupDate}
                                    onChange={(e) => setPickupDate(e.target.value)}
                                    className="w-full sm:w-auto border border-bg-muted rounded-lg px-4 py-2 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                />
                                <p className="text-xs text-text-disabled mt-1">Leave empty for earliest available pickup.</p>
                            </div>

                            <label className="text-xs uppercase tracking-wider text-text-muted font-bold mb-2 block">Available Options</label>
                            <div className="grid gap-3">
                                {couriers.map(courier => (
                                    <div 
                                        key={courier.courier_company_id}
                                        onClick={() => setSelectedCourier(courier.courier_company_id)}
                                        className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                            selectedCourier === courier.courier_company_id 
                                            ? 'border-brand-primary bg-warning/10/30 ring-1 ring-brand-primary' 
                                            : 'border-bg-muted hover:border-warning/20 hover:bg-bg-canvas'
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h4 className="font-bold text-sm text-text-base">{courier.courier_name}</h4>
                                                <p className="text-xs text-text-muted mt-0.5">Rating: {courier.rating} ★</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-brand-primary">₹{courier.rate}</div>
                                                <div className="text-[10px] text-text-muted mt-0.5 whitespace-nowrap">ETA: {courier.etd}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <AlertCircle size={32} className="mx-auto text-danger mb-3" />
                            <p className="text-text-base font-medium">No couriers available</p>
                            <p className="text-sm text-text-muted mt-1">We couldn't find any serviceable couriers for this route.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-bg-muted bg-bg-canvas flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-base transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        disabled={!selectedCourier}
                        onClick={() => {
                            onShip(selectedCourier, pickupDate);
                            onClose();
                        }}
                        className="px-6 py-2 bg-brand-primary text-white text-sm font-medium rounded-lg hover:bg-coffee-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-sm"
                    >
                        Confirm & Ship
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OrderDetails;