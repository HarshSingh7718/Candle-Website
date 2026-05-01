const RecentOrders = () => {
  const orders = [
    {
      id: "#ORD-092",
      customer: "Emma Thompson",
      status: "Shipped",
      statusClass: "bg-[#e8f5e9] text-[#2e7d32]"
    },
    {
      id: "#ORD-091",
      customer: "James Wilson",
      status: "Processing",
      statusClass: "bg-primary-fixed text-on-primary-fixed"
    },
    {
      id: "#ORD-090",
      customer: "Sarah Jenkins",
      status: "Shipped",
      statusClass: "bg-[#e8f5e9] text-[#2e7d32]"
    }
  ];

  return (
    <div className="table-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Recent Orders</h3>
        <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              <th className="pb-3 pr-4 font-semibold">Order</th>
              <th className="pb-3 px-4 font-semibold">Customer</th>
              <th className="pb-3 pl-4 font-semibold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-background">
            {orders.map((order, index) => (
              <tr key={index} className="border-b border-surface-container/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 pr-4 font-medium text-on-surface-variant">{order.id}</td>
                <td className="py-4 px-4">{order.customer}</td>
                <td className="py-4 pl-4 text-right">
                  <span className={`inline-block px-3 py-1 rounded-full font-label-sm text-label-sm ${order.statusClass}`}>
                    {order.status}
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
