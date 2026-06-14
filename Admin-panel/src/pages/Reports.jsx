import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  Download,
  Calendar,
  Filter as FilterIcon,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  ShoppingBag,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import { api } from "../api";

const TABS = ["summary", "orders", "products", "customers"];
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

// Helper to format currency
const formatCurrency = (val) => `₹${Number(val).toLocaleString()}`;

const padTrendsData = (trends = [], startDate, endDate, groupBy) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const padded = [];
  
  if (groupBy === 'day') {
    let current = new Date(start);
    while (current <= end) {
      const periodStr = current.toISOString().split('T')[0];
      const existing = trends.find(t => t.period === periodStr);
      padded.push({
        period: periodStr,
        count: existing ? existing.count : 0,
        revenue: existing ? existing.revenue : 0
      });
      current.setDate(current.getDate() + 1);
    }
    return padded;
  } else if (groupBy === 'month') {
    let current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
    while (current <= endMonth) {
      const year = current.getFullYear();
      const month = String(current.getMonth() + 1).padStart(2, "0");
      const periodStr = `${year}-${month}`;
      const existing = trends.find(t => t.period === periodStr);
      padded.push({
        period: periodStr,
        count: existing ? existing.count : 0,
        revenue: existing ? existing.revenue : 0
      });
      current.setMonth(current.getMonth() + 1);
    }
    return padded;
  }
  return trends;
};

const Reports = () => {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [dateRange, setDateRange] = useState({
    start: thirtyDaysAgo.toISOString().split("T")[0],
    end: today.toISOString().split("T")[0]
  });
  const [groupBy, setGroupBy] = useState("day");
  const [activeTab, setActiveTab] = useState("summary");
  const [isExporting, setIsExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Queries
  const { data: summaryData, isLoading: sumLoading, isFetching: sumFetching } = useQuery({
    queryKey: ["reportSummary", dateRange.start, dateRange.end],
    queryFn: async () => {
      const res = await api.get(`/admin/reports/summary?startDate=${dateRange.start}&endDate=${dateRange.end}`);
      return res.data;
    },
    placeholderData: keepPreviousData
  });

  const { data: tabData, isLoading: tabLoading, isFetching: tabFetching, isError, refetch } = useQuery({
    queryKey: [`report_${activeTab}`, dateRange.start, dateRange.end, groupBy],
    queryFn: async () => {
      const res = await api.get(`/admin/reports/${activeTab}?startDate=${dateRange.start}&endDate=${dateRange.end}&groupBy=${groupBy}`);
      return res.data;
    },
    enabled: activeTab !== "summary",
    placeholderData: keepPreviousData
  });

  const handleExport = async (format) => {
    try {
      setIsExporting(true);
      setShowExportMenu(false);
      const res = await api.post('/admin/reports/export', {
        reportType: activeTab,
        startDate: dateRange.start,
        endDate: dateRange.end,
        groupBy,
        format
      }, {
        responseType: 'blob' // CRITICAL for handling files
      });

      // Handle PDF partial crash/error size check
      if (res.data.size < 500) {
        const text = await res.data.text();
        try {
          const errJson = JSON.parse(text);
          throw new Error(errJson.message || "Export failed");
        } catch(e) {
          if(format === "pdf" && res.data.size < 200) {
            throw new Error("Export failed mid-stream or returned invalid file.");
          }
        }
      }

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${activeTab}_report_${dateRange.start}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success("Export downloaded successfully");
    } catch (error) {
      toast.error(error.message || "Failed to export report");
    } finally {
      setIsExporting(false);
    }
  };

  const renderMetricCard = (title, dataKey, icon, isCurrency = false) => {
    const data = summaryData?.summary?.[dataKey];
    const isLoading = sumLoading;
    const isFetching = sumFetching;
    
    if (isLoading) {
      return (
        <div className="bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted animate-pulse">
          <div className="h-4 w-24 bg-bg-muted rounded mb-4"></div>
          <div className="h-8 w-32 bg-bg-muted rounded mb-2"></div>
          <div className="h-4 w-16 bg-bg-muted rounded"></div>
        </div>
      );
    }

    const value = data?.value || 0;
    const change = data?.percentageChange || 0;
    const isPositive = change >= 0;

    return (
      <div className={`bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-sm font-medium text-text-muted uppercase tracking-wider">{title}</h3>
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-lg">
            {icon}
          </div>
        </div>
        <p className="text-3xl font-bold text-text-base mb-2">
          {isCurrency ? formatCurrency(value) : value.toLocaleString()}
        </p>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-success' : 'text-danger'}`}>
          {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{Math.abs(change).toFixed(1)}%</span>
          <span className="text-text-muted ml-1 font-normal">vs prev period</span>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    if (isError) {
      return (
        <div className="text-center py-20 bg-bg-surface rounded-xl shadow-sm border border-bg-muted ">
          <p className="text-danger mb-4">Failed to load report data.</p>
          <button onClick={() => refetch()} className="px-4 py-2 bg-bg-muted rounded">Retry</button>
        </div>
      );
    }

    if (tabLoading && activeTab !== "summary") {
      return (
        <div className="bg-bg-surface rounded-xl shadow-sm border border-bg-muted h-[400px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-primary"></div>
        </div>
      );
    }

    if (activeTab === "summary") {
      return (
        <div className="bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted h-[400px] flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2 text-text-muted ">Summary View</h3>
            <p className="text-text-muted">Select a specific report tab to view detailed charts.</p>
          </div>
        </div>
      );
    }

    // Apply isFetching transition to the active tab's container
    const isFetchingClass = `transition-opacity duration-200 ${tabFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`;

    if (activeTab === "orders") {
      let data = tabData?.trends || [];
      if (data.length === 0 && !tabFetching) return <EmptyState />;
      data = padTrendsData(data, dateRange.start, dateRange.end, groupBy);
      
      return (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isFetchingClass}`}>
          <div className="lg:col-span-2 bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted ">
            <h3 className="text-lg font-bold mb-6 text-text-base ">Orders & Revenue Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line yAxisId="left" type="monotone" dataKey="count" name="Orders" stroke="#a67067" strokeWidth={3} dot={{ r: 4 }} />
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted ">
            <h3 className="text-lg font-bold mb-6 text-text-base ">Order Status</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tabData?.statusBreakdown || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {(tabData?.statusBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "products") {
      const data = tabData?.topProducts || [];
      if (data.length === 0 && !tabFetching) return <EmptyState />;
      
      const maxRevenue = Math.max(...data.map(d => d.revenue));
      return (
        <div className={`bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted ${isFetchingClass}`}>
          <h3 className="text-lg font-bold mb-6 text-text-base ">Top 10 Products by Revenue</h3>
          <div className="space-y-4">
            {data.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-6 text-text-muted font-medium text-sm">{idx + 1}.</div>
                {product.productId ? (
                  <Link to={`/inventory/edit/${product.productId}`} className="w-1/3 truncate font-medium text-text-base hover:text-brand-primary transition-colors block cursor-pointer">
                    {product.name}
                  </Link>
                ) : (
                  <div className="w-1/3 truncate font-medium text-text-base ">{product.name}</div>
                )}
                <div className="flex-1">
                  <div className="h-4 bg-brand-secondary/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-primary rounded-full"
                      style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-24 text-right font-medium">{formatCurrency(product.revenue)}</div>
                <div className="w-20 text-right text-text-muted text-sm">{product.unitsSold} units</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activeTab === "customers") {
      let data = tabData?.trends || [];
      if (data.length === 0 && !tabFetching) return <EmptyState />;
      data = padTrendsData(data, dateRange.start, dateRange.end, groupBy);
      
      return (
        <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isFetchingClass}`}>
          <div className="lg:col-span-2 bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted ">
            <h3 className="text-lg font-bold mb-6 text-text-base ">New Customers Trend</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="period" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="count" name="New Customers" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="bg-bg-surface p-6 rounded-xl shadow-sm border border-bg-muted flex flex-col justify-center items-center text-center">
            <h3 className="text-lg font-bold mb-2 text-text-base ">Repeat Customer Rate</h3>
            <div className="w-32 h-32 rounded-full border-8 border-brand-primary/20 flex items-center justify-center relative mb-4">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle
                  cx="60"
                  cy="60"
                  r="56"
                  fill="none"
                  stroke="#a67067"
                  strokeWidth="8"
                  strokeDasharray={`${(tabData?.repeatCustomerRate || 0) * 3.51} 351`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-2xl font-bold">{Math.round(tabData?.repeatCustomerRate || 0)}%</span>
            </div>
            <p className="text-text-muted text-sm">{tabData?.activeCustomers} active customers in period</p>
          </div>
        </div>
      );
    }
  };

  const EmptyState = () => (
    <div className="text-center py-20 bg-bg-surface rounded-xl shadow-sm border border-bg-muted ">
      <FilterIcon className="mx-auto text-text-muted mb-4" size={48} />
      <h3 className="text-xl font-medium text-text-muted">No data available for this date range.</h3>
    </div>
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-text-base ">Reports</h1>
      </div>

      {/* Filter Bar */}
      <div className="bg-bg-surface p-4 rounded-xl shadow-sm border border-bg-muted flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 bg-bg-muted border border-bg-muted rounded-lg p-1">
            <div className="flex items-center px-2 text-text-muted"><Calendar size={16} className="mr-2"/> Range</div>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange(prev => ({...prev, start: e.target.value}))}
              className="bg-transparent border-none text-sm outline-none cursor-pointer"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange(prev => ({...prev, end: e.target.value}))}
              className="bg-transparent border-none text-sm outline-none cursor-pointer pr-2"
            />
          </div>
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value)}
            className="px-4 py-2 text-sm bg-bg-muted border border-bg-muted rounded-lg cursor-pointer"
          >
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full lg:w-auto">
          <div className="flex bg-bg-muted p-1 rounded-lg border border-bg-muted overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md capitalize whitespace-nowrap transition-colors ${
                  activeTab === tab 
                    ? "bg-bg-surface text-text-base shadow-sm" 
                    : "text-text-muted hover:text-text-muted "
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative ml-auto">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              disabled={isExporting || activeTab === "summary"}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary hover:bg-coffee-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Download size={16} />}
              Export
            </button>
            
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                <div className="absolute right-0 mt-2 w-48 bg-bg-surface border border-bg-muted rounded-xl shadow-lg z-20 overflow-hidden">
                  <button onClick={() => handleExport('xlsx')} className="w-full text-left px-4 py-3 text-sm hover:bg-bg-muted transition-colors">
                    Download as XLSX
                  </button>
                  <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm hover:bg-bg-muted transition-colors border-t border-stone-100 ">
                    Download as PDF
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {renderMetricCard("Total Revenue", "totalRevenue", <DollarSign size={20} />, true)}
        {renderMetricCard("Total Orders", "totalOrders", <ShoppingBag size={20} />)}
        {renderMetricCard("New Customers", "newCustomers", <Users size={20} />)}
        {renderMetricCard("Avg Order Value", "averageOrderValue", <Package size={20} />, true)}
      </div>

      {/* Charts Body */}
      {renderTabContent()}
    </div>
  );
};

export default Reports;
