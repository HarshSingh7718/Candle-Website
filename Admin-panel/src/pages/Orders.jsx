import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom'; // 👉 1. Import useNavigate
import { useGetOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import TableSkeleton from '../components/Skeletons/TableSkeleton';

import { Search, ChevronRight, ChevronLeft, Plus } from 'lucide-react';

const ORDER_STATUSES = [
  'All',
  'processing',
  'confirmed',
  'packaged',
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

  const navigate = useNavigate(); // 👉 2. Initialize navigate
  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  const { data, isLoading, isFetching } = useGetOrders(page, limit, activeFilter);
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateOrderStatus();

  const orders = data?.orders || [];
  const totalOrders = data?.totalOrders || 0;
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  useEffect(() => {
    if (rowsRef.current.length > 0 && !isLoading) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, [orders, isLoading]);

  const filteredOrders = orders.filter(order => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const orderIdStr = (order.orderId || order._id).toLowerCase();
    const userNameStr = (order.user?.firstName + ' ' + order.user?.lastName)?.toLowerCase() || '';
    return orderIdStr.includes(query) || userNameStr.includes(query);
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'processing': return 'bg-warning/10 text-warning border border-warning/20';
      case 'confirmed': return 'bg-brand-primary/10 text-brand-primary border border-brand-primary/20';
      case 'packaged': return 'bg-info/10 text-info border border-info/20';
      case 'shipped': return 'bg-info/10 text-info border border-info/20';
      case 'out_for_delivery': return 'bg-info/10 text-info border border-info/20';
      case 'delivered': return 'bg-success/10 text-success border border-success/20';
      case 'cancelled': return 'bg-danger/10 text-danger border border-danger/20';
      case 'returned': return 'bg-danger/10 text-danger border border-danger/20';
      default: return 'bg-bg-muted text-text-muted';
    }
  };

  const formatId = (id, orderId) => orderId || (id ? `#${id.slice(-6).toUpperCase()}` : '#UNKNOWN');

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-stack-lg gap-4">
        <div>
          <h2 className="font-heading text-headline-xl text-text-base mb-unit">Order Management</h2>
          <p className="font-body-md text-body-md text-text-muted">Review and fulfill recent artisan orders.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto shrink-0">
          <div className="relative w-full sm:w-auto">
            <Search className=" absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]" />
            <input
              type="text"
              placeholder="Search loaded orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-2 bg-bg-surface border border-bg-muted rounded-lg font-body-md text-body-md text-text-base focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-colors"
            />
          </div>
          <button
            onClick={() => navigate('/orders/create')}
            className="w-full sm:w-auto px-4 py-2 bg-brand-primary text-text-on-brand rounded-lg font-label-md text-label-md hover:bg-coffee-800 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus size={18} />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      <div className="mb-6 w-full overflow-x-auto hide-scrollbar pb-2">
        <div className="flex items-center gap-2 whitespace-nowrap min-w-max">
          {ORDER_STATUSES.map(filter => (
            <span
              key={filter}
              onClick={() => {
                setActiveFilter(filter);
                setPage(1);
              }}
              className={`inline-flex items-center px-4 py-2 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors capitalize ${activeFilter === filter ? 'bg-brand-primary text-text-on-brand shadow-sm' : 'bg-bg-canvas text-text-muted border border-bg-muted hover:bg-bg-surface-hover'}`}
            >
              {filter.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      </div>

      <div className={`bg-bg-surface border border-bg-muted rounded-xl shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="border-b border-bg-muted bg-bg-canvas">
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Order ID</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Date</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Total</th>
                <th className="py-4 px-6 font-label-sm text-label-sm text-text-muted uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bg-muted font-body-md text-body-md text-text-base">
              {isLoading ? (
                <TableSkeleton rows={limit} cols={6} />
              ) : filteredOrders.map((order) => {
                const customerName = (order.user?.firstName + ' ' + order.user?.lastName) || "Guest User";
                const initials = customerName.charAt(0).toUpperCase();
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
                const total = order.totalPrice || order.totalAmount || 0;

                return (
                  <tr
                    key={order._id}
                    ref={addToRowsRef}
                    onClick={() => navigate(`/orders/${order.orderId || order._id}`)} 
                    className="hover:bg-bg-surface-hover transition-colors cursor-pointer group" 
                  >
                    <td className="py-4 px-6 font-label-md text-label-md">{formatId(order._id, order.orderId)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-bg-muted flex items-center justify-center text-text-muted font-bold text-xs flex-shrink-0">
                          {initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="whitespace-nowrap font-medium">{customerName}</span>
                          <span className="text-xs text-text-muted">{order.user?.phoneNumber}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-text-muted whitespace-nowrap">{formattedDate}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold capitalize tracking-wide ${getStatusBadgeClasses(order.orderStatus)}`}>
                        {order.orderStatus?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-label-md text-label-md">₹{total}</td>
                    <td className="py-4 px-6 text-right">
                      <ChevronRight className=" text-text-muted group-hover:text-brand-primary transition-colors" />
                    </td>
                  </tr>
                );
              })}
              {(!isLoading && filteredOrders.length === 0) && (
                <tr>
                  <td colSpan="6" className="py-12 px-6 text-center text-text-muted">
                    No orders found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-bg-muted bg-bg-canvas flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body-md text-body-md text-text-muted">
            Showing {totalOrders === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, totalOrders)} of {totalOrders} orders
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface disabled:opacity-50 cursor-pointer transition-colors"
            >
              <ChevronLeft className=" text-[20px]" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface disabled:opacity-50 cursor-pointer transition-colors"
            >
              <ChevronRight className=" text-[20px]" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Orders;