import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGetOrders, useUpdateOrderStatus } from '../hooks/useOrders';

// The exact statuses from your backend
const ORDER_STATUSES = [
  'All',
  'processing',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
  'returned'
];

const Orders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);
  const limit = 10;

  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  // Fetch from backend
  const { data, isLoading } = useGetOrders(page, limit, activeFilter);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  // Extract pagination data safely
  const orders = data?.orders || [];
  const totalOrders = data?.totalOrders || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    if (isLoading) return;
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, [isLoading]);

  // Re-animate rows when data changes
  useEffect(() => {
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [orders]);

  const handleStatusChange = (orderId, newStatus) => {
    updateStatus({ id: orderId, status: newStatus });
  };

  // Frontend search filter (Optional: You can move this to backend later if needed)
  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const orderIdStr = order._id.toLowerCase();
    const userNameStr = order.user?.name?.toLowerCase() || '';
    return orderIdStr.includes(query) || userNameStr.includes(query);
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  // Dynamic badge colors based on exact backend strings
  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-amber-100 text-amber-800';
      case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'returned': return 'bg-gray-200 text-gray-800';
      default: return 'bg-surface-variant text-on-surface-variant';
    }
  };

  const formatId = (id) => id ? `#${id.slice(-6).toUpperCase()}` : '#UNKNOWN';

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0 pb-20">
      {/* Page Content */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-stack-lg gap-4">
        <div>
          <h2 className="font-heading text-headline-xl text-on-surface mb-unit">Order Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review and fulfill recent artisan orders.</p>
        </div>
        <div className="relative w-full sm:w-auto shrink-0">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search loaded orders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
        </div>
      </div>

      {/* 👉 Mobile-Optimized Horizontally Scrollable Filters */}
      <div className="mb-6 w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
          {ORDER_STATUSES.map(filter => (
            <span
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1); // Reset to page 1 on filter change
              }}
              className={`inline-flex items-center px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors capitalize ${activeFilter === filter ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}
            >
              {filter.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-surface-variant bg-surface-container-low">
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-variant font-body-md text-body-md text-on-surface">
              {filteredOrders.map((order) => {
                const customerName = order.user?.name || "Guest User";
                const initials = customerName.charAt(0).toUpperCase();
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                // Fallback to totalPrice or totalAmount depending on your schema
                const total = order.totalPrice || order.totalAmount || 0;

                return (
                  <tr key={order._id} ref={addToRowsRef} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 px-6 font-label-md text-label-md">{formatId(order._id)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-xs flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-medium">{customerName}</span>
                          <span className="text-xs text-on-surface-variant">{order.user?.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">{formattedDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${getStatusBadgeClasses(order.orderStatus)}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-label-md text-label-md">₹{total}</td>
                    <td className="py-4 px-6 text-right">
                      {/* 👉 Instant Status Update Dropdown */}
                      <select
                        disabled={isUpdating}
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="px-3 py-2 bg-surface-container border border-outline-variant text-on-surface rounded font-label-sm text-label-sm hover:bg-surface-container-high transition-colors cursor-pointer outline-none capitalize disabled:opacity-50"
                      >
                        {ORDER_STATUSES.filter(s => s !== 'All').map(s => (
                          <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 px-6 text-center text-on-surface-variant">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Database Pagination */}
        <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body-md text-body-md text-on-surface-variant">
            Showing {totalOrders === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalOrders)} of {totalOrders} orders
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 cursor-pointer transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Orders;