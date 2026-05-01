import { useEffect, useRef } from "react";
import gsap from "gsap";

const RevenueChart = () => {
  const chartRef = useRef(null);

  const chartData = [
    { month: 'Jan', height: '33.33%', colorClass: 'bg-surface-container-high' },
    { month: 'Feb', height: '50%', colorClass: 'bg-surface-container-high' },
    { month: 'Mar', height: '40%', colorClass: 'bg-surface-container-high' },
    { month: 'Apr', height: '75%', colorClass: 'bg-primary-fixed-dim' },
    { month: 'May', height: '80%', colorClass: 'bg-primary-fixed' },
    { month: 'Jun', height: '100%', colorClass: 'bg-primary shadow-[0_-4px_12px_rgba(141,75,0,0.2)]' },
  ];

  useEffect(() => {
    const bars = chartRef.current.querySelectorAll('.chart-bar');
    gsap.fromTo(
      bars,
      { height: "0%" },
      { height: (index, target) => target.dataset.height, duration: 1, ease: "power3.out", stagger: 0.1, delay: 0.5 }
    );
  }, []);

  return (
    <div className="chart-container lg:col-span-2 bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Monthly Revenue</h3>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div className="flex-1 bg-surface-container-lowest rounded-lg border border-surface-container flex items-center justify-center min-h-[300px] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#887364_1px,transparent_1px),linear-gradient(to_bottom,#887364_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div ref={chartRef} className="relative w-full h-full px-8 pt-8 pb-4 flex items-end gap-4">
          {chartData.map((data, idx) => (
             <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full z-10">
               <div className={`chart-bar w-full ${data.colorClass} rounded-t-sm`} data-height={data.height}></div>
               <span className="font-label-sm text-on-surface-variant text-xs mt-3 bg-surface-container-lowest px-2 py-0.5 rounded-sm shadow-sm border border-outline-variant/30">{data.month}</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
