const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-surface-container-lowest border-b border-surface-container shadow-sm flex justify-between items-center w-full px-4 sm:px-8 h-16 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 ease-out p-1.5 rounded-md flex items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        <div className="font-heading italic font-semibold text-on-background text-headline-md hidden sm:block">
          Naisha Creations
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-surface-variant">
          <a href="/profile">
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
