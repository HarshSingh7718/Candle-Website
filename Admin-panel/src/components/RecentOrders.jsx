import { useNavigate } from 'react-router-dom';

const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return "bg-success/10 text-success border border-success/20";
    case 'processing': return "bg-warning/10 text-warning border border-warning/20";
    case 'shipped': return "bg-info/10 text-info border border-info/20";
    default: return "bg-bg-muted text-text-muted";
  }
};

const RecentOrders = ({ orders = [] }) => {
  const navigate = useNavigate();
  return (
    <div className="table-container bg-bg-surface rounded-xl p-6 border border-bg-muted shadow-sm shadow-stone-200/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-text-base">Recent Orders</h3>
      </div>
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-bg-muted font-label-md text-label-md text-text-muted uppercase tracking-wide">
              <th className="pb-3 pr-4 font-semibold">Order ID</th>
              <th className="pb-3 px-4 font-semibold">Customer</th>
              <th className="pb-3 pl-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-text-base">
            {orders.map((order) => (
              <tr 
                key={order._id} 
                onClick={() => navigate(`/orders/${order.orderId || order._id}`)}
                className="border-b border-bg-muted/50 last:border-0 hover:bg-bg-surface-hover transition-colors cursor-pointer group"
              >
                <td className="py-4 pr-4 font-medium text-text-muted group-hover:text-brand-primary transition-colors">#{order.orderId}</td>
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