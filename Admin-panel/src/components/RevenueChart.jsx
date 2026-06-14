import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RevenueChart = ({ data, selectedMonth, selectedYear, onMonthChange, isFetching }) => {
  const currentMonthNum = new Date().getMonth() + 1;
  const currentYearNum = new Date().getFullYear();
  
  // Create an array of months from Jan to current month (if viewing current year)
  const availableMonths = Array.from({ length: selectedYear === currentYearNum ? currentMonthNum : 12 }, (_, i) => {
    const date = new Date(0, i);
    return {
      value: i + 1,
      label: date.toLocaleString('default', { month: 'short' })
    };
  });

  const selectedMonthName = new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'short' });
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();

  const formattedData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const existingData = data?.find(item => item._id === day);
    return {
      name: `${day} ${selectedMonthName}`,
      revenue: existingData ? existingData.revenue : 0
    };
  });

  return (
    <div className="chart-container lg:col-span-2 bg-bg-surface rounded-xl p-6 border border-bg-muted shadow-sm shadow-stone-200/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-text-base">Daily Revenue</h3>
        
        <select 
          value={selectedMonth} 
          onChange={(e) => onMonthChange(Number(e.target.value))}
          className="bg-bg-canvas border border-bg-muted text-text-base text-sm rounded-lg focus:ring-1 focus:ring-brand-primary focus:border-brand-primary block px-3 py-1.5 outline-none cursor-pointer shadow-sm hover:border-brand-secondary transition-colors"
        >
          {availableMonths.map(month => (
            <option key={month.value} value={month.value}>
              {month.label} {selectedYear}
            </option>
          ))}
        </select>
      </div>
      <div className={`flex-1 bg-bg-surface rounded-lg border border-bg-muted min-h-[300px] relative overflow-hidden pt-6 transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#a67067_1px,transparent_1px),linear-gradient(to_bottom,#a67067_1px,transparent_1px)] bg-[size:40px_40px]"></div>

        {isFetching && (
          <div className="absolute inset-0 z-20 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#595554', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#595554', fontSize: 12 }} tickFormatter={(value) => `₹${value}`} />
            <Tooltip
              cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }}
              contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e5d5d5' }}
              formatter={(value) => [`₹${value}`, 'Revenue']}
            />
            <Line type="monotone" dataKey="revenue" stroke="#a67067" strokeWidth={3} dot={{ r: 4, fill: '#a67067' }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
};

export default RevenueChart;