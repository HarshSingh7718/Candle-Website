const Navbar = ({ toggleSidebar }) => {
  return (
    <header className="bg-surface-container-lowest border-b border-surface-container shadow-sm flex justify-between items-center w-full px-4 sm:px-8 h-16 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 ease-out p-1.5 rounded-md flex items-center justify-center cursor-pointer active:scale-95"
        >
          <span className="material-symbols-outlined text-[28px]">menu</span>
        </button>
        <div className="font-heading italic font-semibold text-on-background text-headline-md hidden sm:block">
          Naisha Creations
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-on-surface-variant hover:text-primary transition-colors duration-300 ease-out">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="text-on-surface-variant hover:text-primary transition-colors duration-300 ease-out">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-container border border-surface-variant">
          <img
            alt="Administrator profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIpc-MKeaz0Z-UUlY8yTNX8WDQGSSAQbOKevBbA8IeKXOPaXsPFc2mtGD7oc2tawpFmGVi_upfqvoolJNtKq0_3uJ-b29PCL3n3X_6j0P4SKYq2JrZvuof3rRbuV4eCVVY_J1wWXj35vvLtAFVOwr_7UbhuVoqxrxhtXMhtCWhO2dUvvo24v2vVIYS7kZ2-_Ktq3C__WNjDRPM_fYSzwVou3jDYY1OT_YDlAfpl1rPKQpW1lnnZRh07IL7FKkfQzJ9Fu0e4phRIUPY"
          />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
