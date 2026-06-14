import React from 'react';

const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <tr key={`skeleton-row-${rowIndex}`} className="border-b border-bg-muted animate-pulse">
          {Array.from({ length: cols }).map((_, colIndex) => {
            // First column: avatar + text lines
            if (colIndex === 0) {
              return (
                <td key={`skeleton-col-${colIndex}`} className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-md bg-bg-muted flex-shrink-0"></div>
                    <div className="min-w-0 flex-1">
                      <div className="h-4 bg-bg-muted rounded w-32 mb-2"></div>
                      <div className="h-3 bg-bg-muted rounded w-20"></div>
                    </div>
                  </div>
                </td>
              );
            }
            
            // Last column: right aligned actions
            if (colIndex === cols - 1) {
               return (
                 <td key={`skeleton-col-${colIndex}`} className="px-6 py-4 text-right">
                   <div className="h-8 bg-bg-muted rounded w-16 ml-auto"></div>
                 </td>
               );
            }

            // Middle columns: simple text line
            return (
              <td key={`skeleton-col-${colIndex}`} className="px-6 py-4">
                <div className="h-4 bg-bg-muted rounded w-full max-w-[80px]"></div>
              </td>
            );
          })}
        </tr>
      ))}
    </>
  );
};

export default TableSkeleton;
