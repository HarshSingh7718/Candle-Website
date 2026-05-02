import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const RevenueChart = ({ data }) => {
  // Map backend IDs (1-12) to month names
  const formattedData = data?.map(item => ({
    name: monthNames[item._id - 1],
    revenue: item.revenue
  })) || [];

  return (
    <div className="chart-container lg:col-span-2 bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Monthly Revenue</h3>
      </div>
      <div className="flex-1 bg-surface-container-lowest rounded-lg border border-surface-container min-h-[300px] relative overflow-hidden pt-6">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#887364_1px,transparent_1px),linear-gradient(to_bottom,#887364_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
            <Tooltip
              cursor={{ fill: 'transparent' }}
              contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e7e5e4' }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            {/* Using your exact primary color for the bars */}
            <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

export default RevenueChart;