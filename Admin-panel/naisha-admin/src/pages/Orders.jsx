import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';

const initialOrders = [
  { 
    id: 'ORD-2023-089', 
    initials: 'EJ', 
    name: 'Eleanor James', 
    date: 'Oct 24, 2023', 
    status: 'Pending', 
    total: '$145.00' 
  },
  { 
    id: 'ORD-2023-088', 
    initials: 'MW', 
    name: 'Marcus Wei', 
    date: 'Oct 23, 2023', 
    status: 'Shipped', 
    total: '$85.50' 
  },
  { 
    id: 'ORD-2023-087', 
    initials: 'SL', 
    name: 'Sarah Lin', 
    date: 'Oct 22, 2023', 
    status: 'Delivered', 
    total: '$210.00' 
  }
];

const Orders = () => {
  const [orders, setOrders] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const mainRef = useRef(null);
  const rowsRef = useRef([]);

  useEffect(() => {
    // Fade + slide up entire page content
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Stagger in table rows
    if (rowsRef.current.length > 0) {
      gsap.fromTo(
        rowsRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.3 }
      );
    }
  }, [searchQuery, activeFilter]); // Re-run animation if filter changes

  const cycleStatus = (id) => {
    setOrders(orders.map(order => {
      if (order.id === id) {
        let newStatus = 'Pending';
        if (order.status === 'Pending') newStatus = 'Shipped';
        else if (order.status === 'Shipped') newStatus = 'Delivered';
        
        return { ...order, status: newStatus };
      }
      return order;
    }));
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          order.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (activeFilter === 'Delivered') {
      matchesFilter = order.status === 'Delivered';
    } else if (activeFilter === 'Pending') {
      matchesFilter = order.status === 'Pending' || order.status === 'Shipped';
    }
    
    return matchesSearch && matchesFilter;
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) {
      rowsRef.current.push(el);
    }
  };

  const getStatusBadgeClasses = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-100 text-amber-800';
      case 'Shipped':
        return 'bg-[#e6e2d7] text-[#48473f]'; // tertiary-fixed colors
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-surface-variant text-on-surface-variant';
    }
  };

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full">
      {/* Page Content */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-stack-lg gap-4">
        <div>
          <h2 className="font-heading text-headline-xl text-on-surface mb-unit">Order Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Review and fulfill recent artisan orders.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-auto">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
            <input 
              type="text"
              placeholder="Search orders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors" 
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['All', 'Delivered', 'Pending'].map(filter => (
              <span 
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full font-label-sm text-label-sm cursor-pointer transition-colors whitespace-nowrap ${activeFilter === filter ? 'bg-surface-container-highest text-on-surface' : 'bg-surface-container text-on-surface-variant border border-outline-variant hover:bg-surface-container-high'}`}
              >
                {filter}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table/List */}
      <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-[0_4px_24px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
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
              {filteredOrders.map((order) => (
                <tr key={order.id} ref={addToRowsRef} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="py-4 px-6 font-label-md text-label-md">{`#${order.id}`}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center text-on-surface-variant font-bold text-xs flex-shrink-0">
                        {order.initials}
                      </div>
                      <span className="whitespace-nowrap">{order.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-on-surface-variant whitespace-nowrap">{order.date}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 font-label-md text-label-md">{order.total}</td>
                  <td className="py-4 px-6 text-right">
                    {order.status !== 'Delivered' ? (
                      <button 
                        onClick={() => cycleStatus(order.id)}
                        className="px-4 py-2 bg-primary text-on-primary rounded font-label-md text-label-md shadow-[0_2px_0_0_rgba(0,0,0,0.1)] hover:bg-primary-container hover:text-on-primary-container transition-colors active:translate-y-[1px] active:shadow-none cursor-pointer whitespace-nowrap"
                      >
                        Update Status
                      </button>
                    ) : (
                      <button className="px-4 py-2 border border-outline text-on-surface rounded font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer whitespace-nowrap">
                        View Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 px-6 text-center text-on-surface-variant">
                    No orders found matching "{searchQuery}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (Simple) */}
        <div className="px-6 py-4 border-t border-surface-variant bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-body-md text-body-md text-on-surface-variant">
            Showing 1 to {Math.min(3, filteredOrders.length)} of {orders.length} orders
          </span>
          <div className="flex gap-2">
            <button className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container disabled:opacity-50 cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">chevron_left</span>
            </button>
            <button className="p-2 rounded border border-outline-variant text-on-surface-variant hover:bg-surface-container cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">chevron_right</span>
            </button>
          </div>
        </div>

      </div>
    </main>
  );
};

export default Orders;
