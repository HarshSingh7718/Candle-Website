import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '../hooks/useDashboard'; // Your data hook
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import DonutChart from '../components/DonutChart';
import TopProducts from '../components/TopProducts';
import RecentOrders from '../components/RecentOrders';
import Reviews from '../components/Reviews';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

const Dashboard = () => {
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const { data: dashboard, isLoading, isError } = useDashboardStats();

  useEffect(() => {
    if (isLoading || isError) return; // Don't animate until data loads

    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    gsap.fromTo(".stats-card", { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 });
    gsap.fromTo(".table-container, .chart-container, .review-card", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.5 });
  }, [isLoading, isError]);

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (isError) {
    return <div className="p-8 text-red-500 font-heading">Failed to load dashboard data.</div>;
  }

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-stack-md opacity-0">
      <div className="flex justify-between items-end mb-stack-md">
        <div>
          <h2 className="font-heading text-headline-lg text-on-background mb-2">Overview</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Welcome back. Here's what's happening with your atelier today.
          </p>
        </div>
        <div className="hidden md:flex gap-4">
          <button
            onClick={() => navigate('/inventory/add')}
            className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-[0_2px_4px_rgba(141,75,0,0.2)] hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 cursor-pointer"
          >
            Add Product
          </button>
        </div>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(dashboard.totalRevenue)}
          icon="attach_money"
          iconBgClass="bg-primary-fixed"
          iconTextClass="text-on-primary-fixed"
        />
        <StatsCard
          title="Total Orders"
          value={dashboard.totalOrders}
          icon="local_mall"
          iconBgClass="bg-surface-container-high"
          iconTextClass="text-on-surface"
        />
        <StatsCard
          title="Total Products"
          value={dashboard.totalProducts}
          icon="inventory_2"
          iconBgClass="bg-surface-container-high"
          iconTextClass="text-on-surface"
        />
        <StatsCard
          title="Total Users"
          value={dashboard.totalUsers}
          icon="group"
          iconBgClass="bg-surface-container-high"
          iconTextClass="text-on-surface"
        />
      </div>

      {/* --- CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart data={dashboard.monthlyRevenue} />
        <DonutChart data={dashboard.orderStats} />
      </div>

      {/* --- TABLES --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopProducts products={dashboard.topProducts} />
        <RecentOrders orders={dashboard.recentOrders} />
      </div>

      {/* --- REVIEWS --- */}
      <Reviews reviews={dashboard.recentReviews} />
    </main>
  );
};

export default Dashboard;