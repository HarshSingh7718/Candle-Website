const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return "bg-[#e8f5e9] text-[#2e7d32]";
    case 'processing': return "bg-[#fff3e0] text-[#e65100]";
    case 'shipped': return "bg-[#e3f2fd] text-[#1565c0]";
    default: return "bg-surface-container-high text-on-surface";
  }
};

const RecentOrders = ({ orders = [] }) => {
  return (
    <div className="table-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Recent Orders</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              <th className="pb-3 pr-4 font-semibold">Order ID</th>
              <th className="pb-3 px-4 font-semibold">Customer</th>
              <th className="pb-3 pl-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-background">
            {orders.map((order) => (
              <tr key={order._id} className="border-b border-surface-container/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 pr-4 font-medium text-on-surface-variant">#{order._id.slice(-6).toUpperCase()}</td>
                <td className="py-4 px-4">{order.user?.firstName || "Guest"}</td>
                <td className="py-4 pl-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full font-label-sm text-label-sm capitalize ${getStatusStyles(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentOrders;