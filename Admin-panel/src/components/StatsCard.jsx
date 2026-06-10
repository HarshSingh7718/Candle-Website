import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, icon: Icon, trend: TrendIcon, trendValue, iconBgClass, iconTextClass, isPositive, linkTo }) => {
  const CardWrapper = linkTo ? Link : 'div';
  
  return (
    <CardWrapper 
      to={linkTo}
      className={`stats-card bg-bg-surface rounded-xl p-6 border border-bg-muted shadow-sm flex flex-col justify-between h-40 transition-all duration-300 ${linkTo ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 hover:border-brand-primary/50 group' : ''}`}
    >
      <div className="flex justify-between items-start">
        <span className="font-label-md text-label-md text-text-muted uppercase tracking-wider group-hover:text-text-base transition-colors">
          {title}
        </span>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${iconBgClass} ${iconTextClass} transition-transform group-hover:scale-110`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div>
        <div className="font-heading text-headline-lg text-text-base">{value}</div>
        <div className={`flex items-center gap-1 text-sm mt-1 ${isPositive ? 'text-success' : 'text-text-muted'}`}>
          {TrendIcon && (
            <TrendIcon className="w-4 h-4" />
          )}
          <span>{trendValue}</span>
        </div>
      </div>
    </CardWrapper>
  );
};

export default StatsCard;
