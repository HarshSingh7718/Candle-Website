import React from 'react';

const Loader = () => {
  return (
    <div className="min-h-[50vh] flex items-center justify-center w-full">
      <style>
        {`
          @keyframes slideRightToLeft {
            0% { transform: translateX(300%); }
            100% { transform: translateX(-300%); }
          }
          .animate-line-right-to-left {
            animation: slideRightToLeft 1.5s infinite ease-in-out;
            right: 0;
          }
        `}
      </style>
      <div className="w-48 sm:w-64 h-[2px] bg-muted/30 overflow-hidden relative">
        <div className="absolute top-0 h-full bg-coffee w-1/3 animate-line-right-to-left"></div>
      </div>
    </div>
  );
};

export default Loader;
