import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import DonutChart from '../components/DonutChart';
import TopProducts from '../components/TopProducts';
import RecentOrders from '../components/RecentOrders';
import Reviews from '../components/Reviews';

const Dashboard = () => {
  const mainRef = useRef(null);
const navigate = useNavigate();
  useEffect(() => {
    // Fade + slide up entire dashboard content
    gsap.fromTo(
      mainRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }
    );

    // Scale-up + fade in for stats cards
    gsap.fromTo(
      ".stats-card",
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)", delay: 0.3 }
    );

    // Fade + slight slide from bottom for tables and other containers
    gsap.fromTo(
      ".table-container, .chart-container, .review-card",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out", delay: 0.5 }
    );
  }, []);

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-stack-md">
          <div className="flex justify-between items-end mb-stack-md">
            <div>
              <h2 className="font-heading text-headline-lg text-on-background mb-2">Overview</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Welcome back. Here's what's happening with your atelier today.
              </p>
            </div>
            <div className="hidden md:flex gap-4">
              
              <button 
              onClick={() => navigate('/inventory/add')} className="px-6 py-3 rounded-lg bg-primary text-on-primary font-label-md text-label-md shadow-[0_2px_4px_rgba(141,75,0,0.2)] hover:bg-primary-container hover:text-on-primary-container transition-colors duration-200 cursor-pointer">
                Add Product
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Revenue"
              value="$42,500"
              icon="attach_money"
              trend="trending_up"
              trendValue="+12.5% from last month"
              iconBgClass="bg-primary-fixed"
              iconTextClass="text-on-primary-fixed"
              isPositive={true}
            />
            <StatsCard
              title="Total Orders"
              value="1,248"
              icon="local_mall"
              trend="trending_up"
              trendValue="+5.2% from last month"
              iconBgClass="bg-surface-container-high"
              iconTextClass="text-on-surface"
              isPositive={true}
            />
            <StatsCard
              title="Total Products"
              value="156"
              icon="inventory_2"
              trendValue="12 low stock alerts"
              iconBgClass="bg-surface-container-high"
              iconTextClass="text-on-surface"
              isPositive={false}
            />
            <StatsCard
              title="Total Users"
              value="3,892"
              icon="group"
              trend="trending_up"
              trendValue="+18.4% from last month"
              iconBgClass="bg-surface-container-high"
              iconTextClass="text-on-surface"
              isPositive={true}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            <DonutChart />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProducts />
            <RecentOrders />
          </div>

          <Reviews />
    </main>
  );
};

export default Dashboard;
