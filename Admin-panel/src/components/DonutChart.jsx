import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// 👉 1. The Strict Color Dictionary
// Add or adjust any statuses your backend throws here
const STATUS_COLORS = {
  delivered: '#10b981',  // Emerald Green
  out_for_delivery: '#22c55e', // Green
  shipped: '#3b82f6',    // Blue
  confirmed: '#8b5cf6',  // Violet
  processing: '#f59e0b', // Amber
  cancelled: '#000000',  // Black
  returned: '#ef4444',   // Red
};

const STATUS_SORT_ORDER = {
  delivered: 1,
  out_for_delivery: 2,
  shipped: 3,
  confirmed: 4,
  processing: 5,
  cancelled: 6,
  returned: 7,
};

// 👉 2. Custom Tooltip (Automatically inherits the slice's exact color)
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    // Recharts passes the exact fill color of the slice into payload[0].payload.fill
    const dotColor = payload[0].payload.fill;

    return (
      <div className="bg-white px-4 py-3 rounded-lg shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 outline-none z-50 relative">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-2.5 h-2.5 rounded-full shadow-sm"
            style={{ backgroundColor: dotColor }}
          ></div>
          <span className="font-label-md font-medium text-gray-900 capitalize">
            {payload[0].name}
          </span>
        </div>
        <p className="font-body-md text-gray-500 text-sm ml-4.5">
          Orders: <span className="font-bold text-gray-900">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

const DonutChart = ({ data }) => {
  // Map data and keep the raw status lowercase so we can look up its color safely
  const formattedData = data?.map(stat => {
    const rawStatus = stat.status.toLowerCase();
    return {
      name: stat.status.charAt(0).toUpperCase() + stat.status.slice(1),
      rawStatus: rawStatus,
      value: stat.count,
      // 👉 Look up the specific color, or use default if it's a new unknown status
      fill: STATUS_COLORS[rawStatus],
      sortPriority: STATUS_SORT_ORDER[rawStatus]
    };
  }).sort((a, b) => a.sortPriority - b.sortPriority) || [];

  const total = formattedData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="chart-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Order Status</h3>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 relative">
        <div className="w-48 h-48 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={formattedData}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {/* Apply the mapped color to each slice */}
                {formattedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} cursor={false} wrapperStyle={{ zIndex: 100 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="block font-heading text-headline-lg text-on-background">{total}</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Total</span>
          </div>
        </div>

        {/* Apply the mapped color to the Legend */}
        <div className="w-full space-y-3">
          {formattedData.map((item) => (
            <div key={item.name} className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }}></div>
                <span className="font-body-md text-body-md text-on-surface">{item.name}</span>
              </div>
              <span className="font-label-md text-label-md text-on-background">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;