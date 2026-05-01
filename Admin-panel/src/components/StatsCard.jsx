const StatsCard = ({ title, value, icon, trend, trendValue, iconBgClass, iconTextClass, isPositive }) => {
  return (
    <div className="stats-card bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50 flex flex-col justify-between h-40">
      <div className="flex justify-between items-start">
        <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${iconBgClass} ${iconTextClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
      </div>
      <div>
        <div className="font-heading text-headline-lg text-on-background">{value}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-green-700' : 'text-stone-500'}`}>
          {trend && (
            <span className="material-symbols-outlined text-sm">{trend}</span>
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
