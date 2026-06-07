const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-bg-surface border-b border-bg-muted shadow-sm flex justify-between items-center w-full px-4 sm:px-8 h-16 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-text-muted hover:text-text-base hover:bg-bg-muted transition-all duration-300 ease-out p-1.5 rounded-md flex items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        <a href="/dashboard">
        <div className="font-heading italic font-semibold text-text-base text-headline-md hidden sm:block">
          Naisha Creations
        </div>
        </a>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-bg-canvas border border-bg-muted">
          <a href="/setting">
            <img
              alt="Administrator profile"
              className="w-full h-full object-cover cursor-pointer"
              src="/favicon/favicon.svg"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
