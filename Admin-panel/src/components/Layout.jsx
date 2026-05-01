import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen relative bg-background text-on-background font-body-md">
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <Navbar toggleSidebar={() => setIsSidebarOpen(true)} />
        <div className="flex-1 w-full relative">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout;
