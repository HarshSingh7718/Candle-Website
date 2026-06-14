import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, AlertTriangle, MapPin, Package, Clock, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../api";

const UserDetailModal = ({ userId, onClose, onUpdate }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminUserDetail", userId],
    queryFn: async () => {
      const res = await api.get(`/admin/users/${userId}`);
      return res.data;
    }
  });

  const blockMutation = useMutation({
    mutationFn: async () => {
      const res = await api.put(`/admin/users/${userId}/block`);
      return res.data;
    },
    onSuccess: (resData) => {
      toast.success("User successfully blocked.");
      setShowConfirm(false);
      onUpdate();
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to block user.");
      setShowConfirm(false);
    }
  });

  // Handle Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (isLoading) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-bg-surface rounded-xl p-8 w-full max-w-2xl text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto"></div>
        </div>
      </div>,
      document.body
    );
  }

  if (isError || !data?.user) {
    return createPortal(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-bg-surface rounded-xl p-8 w-full max-w-2xl text-center" onClick={e => e.stopPropagation()}>
          <X className="w-12 h-12 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold">Failed to load user</h2>
          <button onClick={onClose} className="mt-6 px-4 py-2 bg-bg-muted rounded">Close</button>
        </div>
      </div>,
      document.body
    );
  }

  const { user, recentOrders } = data;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-bg-surface rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto hide-scrollbar shadow-2xl flex flex-col" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" >
        {/* Header */}
        <div className="flex justify-between items-start p-6 border-b border-bg-muted sticky top-0 bg-bg-surface z-10">
          <div>
            <h2 className="text-2xl font-bold text-text-base flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold text-sm flex-shrink-0">{(user.firstName?.[0] || "") + (user.lastName?.[0] || "")}</div>
              {user.firstName} {user.lastName}
              {user.role === "admin" && (
                <span className="text-xs bg-info/10 text-info px-2 py-1 rounded-full flex items-center gap-1">
                  <ShieldAlert size={12} /> Admin
                </span>
              )}
            </h2>
            <p className="text-text-muted text-sm mt-1">{user.email} {user.phoneNumber && `• ${user.phoneNumber}`}</p>
          </div>
          <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-muted rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        {/* Body */}
        <div className="p-6 space-y-8 flex-1">
          {/* Account Status Area */}
          <div className="bg-bg-muted rounded-xl p-5 border border-bg-muted flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Account Status</h3>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${ user.isActive ? "bg-success/10 text-success " : "bg-danger/10 text-danger " }`}>
                  {user.isActive ? "Active" : "Blocked"}
                </span>
                <span className="text-sm text-text-muted">
                  Joined: {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
            </div>
            {/* Block Action Area */}
            {user.role !== "admin" && (
              <div className="w-full sm:w-auto">
                {!user.isActive ? (
                  <span className="inline-block px-4 py-2 border border-danger/20 text-danger bg-danger/10 rounded-lg cursor-not-allowed opacity-75 font-medium w-full sm:w-auto text-center">
                    User Blocked
                  </span>
                ) : !showConfirm ? (
                  <button onClick={() => setShowConfirm(true)} className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors" >
                    Block User
                  </button>
                ) : (
                  <div className="flex items-center gap-2 bg-danger/5 p-2 rounded-lg border border-danger/20 w-full sm:w-auto">
                    <AlertTriangle size={18} className="text-red-600" />
                    <span className="text-sm text-danger font-medium whitespace-nowrap">Are you sure?</span>
                    <button onClick={() => blockMutation.mutate()} disabled={blockMutation.isPending} className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded font-medium ml-2 disabled:opacity-50" >
                      {blockMutation.isPending ? "..." : "Confirm"}
                    </button>
                    <button onClick={() => setShowConfirm(false)} disabled={blockMutation.isPending} className="px-3 py-1 text-text-muted hover:bg-bg-muted text-sm rounded transition-colors" >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Address Book */}
            <div>
              <h3 className="text-lg font-bold text-text-base flex items-center gap-2 mb-4">
                <MapPin size={20} className="text-text-muted" /> Address Book
              </h3>
              {user.addresses?.length > 0 ? (
                <div className="space-y-3">
                  {user.addresses.map((addr, i) => (
                    <div key={i} className="p-4 rounded-xl border border-bg-muted bg-bg-muted relative">
                      {addr.isDefault && (
                        <span className="absolute top-3 right-3 text-[10px] uppercase font-bold bg-brand-primary/10 text-brand-primary px-2 py-0.5 rounded-sm">Default</span>
                      )}
                      <p className="font-medium text-text-base ">{addr.firstName} {addr.lastName}</p>
                      <p className="text-sm text-text-muted mt-1">{addr.address}</p>
                      <p className="text-sm text-text-muted ">{addr.city}, {addr.state} {addr.pincode}</p>
                      {addr.phone && <p className="text-sm text-text-muted mt-2">Phone: {addr.phone}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm italic">No addresses saved.</p>
              )}
            </div>
            {/* Recent Orders */}
            <div>
              <h3 className="text-lg font-bold text-text-base flex items-center gap-2 mb-4">
                <Package size={20} className="text-text-muted" /> Recent Orders
              </h3>
              {recentOrders?.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map(order => (
                    <Link to={`/orders/${order.orderId || order._id}`} onClick={onClose} key={order._id} className="p-4 rounded-xl border border-bg-muted flex justify-between items-center hover:bg-bg-muted transition-colors block cursor-pointer group" >
                      <div>
                        <p className="font-medium font-mono text-sm text-brand-primary group-hover:text-coffee-800 transition-colors">{order.orderId}</p>
                        <p className="text-xs text-text-muted flex items-center gap-1 mt-1">
                          <Clock size={12} /> {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-text-base ">₹{order.totalAmount}</p>
                        <p className="text-xs text-text-muted capitalize mt-1">{order.orderStatus}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-text-muted text-sm italic">No orders found.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default UserDetailModal;
