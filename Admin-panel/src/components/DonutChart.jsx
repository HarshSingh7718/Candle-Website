const DonutChart = () => {
  return (
    <div className="chart-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Order Status</h3>
        <button className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="w-48 h-48 rounded-full border-[16px] border-surface-container-high relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-[16px] border-primary border-r-transparent border-b-transparent transform -rotate-45"></div>
          <div className="absolute inset-0 rounded-full border-[16px] border-primary-fixed-dim border-t-transparent border-l-transparent transform rotate-45"></div>
          <div className="text-center">
            <span className="block font-heading text-headline-lg text-on-background">84%</span>
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Completed</span>
          </div>
        </div>
        <div className="w-full space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary"></div>
              <span className="font-body-md text-body-md text-on-surface">Completed</span>
            </div>
            <span className="font-label-md text-label-md text-on-background">1,048</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary-fixed-dim"></div>
              <span className="font-body-md text-body-md text-on-surface">Processing</span>
            </div>
            <span className="font-label-md text-label-md text-on-background">150</span>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-surface-container-high"></div>
              <span className="font-body-md text-body-md text-on-surface">Pending</span>
            </div>
            <span className="font-label-md text-label-md text-on-background">50</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonutChart;
