import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGetProducts, useDeleteProduct, useToggleProductStatus } from '../hooks/useProducts';
import { useVirtualizer } from '@tanstack/react-virtual';

const Inventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, isFetching } = useGetProducts();
  const products = data || [];
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const mainRef = useRef(null);
  const tableRef = useRef(null);
  const rowsRef = useRef([]);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    if (isLoading || !data) return;
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, [isLoading, data]);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'All Products') return matchesSearch;
    if (activeTab === 'Low Stock') return matchesSearch && p.stock <= 5;
    if (activeTab === 'Drafts') return matchesSearch && !p.isActive;
    return matchesSearch;
  });

  const addToRowsRef = (el) => {
    if (el && !rowsRef.current.includes(el)) rowsRef.current.push(el);
  };

  const rowVirtualizer = useVirtualizer({
    count: filteredProducts.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 80, // Approximate row height
    overscan: 5,
  });



  const virtualItems = rowVirtualizer.getVirtualItems();
  const paddingTop = virtualItems.length > 0 ? virtualItems[0]?.start || 0 : 0;
  const paddingBottom = virtualItems.length > 0
    ? rowVirtualizer.getTotalSize() - (virtualItems[virtualItems.length - 1]?.end || 0)
    : 0;

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-8 opacity-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-heading text-headline-xl text-text-base mb-2">Inventory Management</h2>
          <p className="font-body-md text-body-md text-text-muted">
            Manage your artisan candle collection, track stock levels, and update product details.
          </p>
        </div>
        <button
          onClick={() => navigate('/inventory/add')}
          className="px-6 py-3 rounded-md bg-brand-primary text-white font-label-md text-label-md hover:bg-coffee-800 transition-colors duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`bg-bg-surface rounded-xl shadow-sm border border-bg-muted overflow-hidden transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} ref={tableRef}>

        {/* Toolbar: Tabs & Search */}
        <div className="p-6 border-b border-bg-muted flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            {['All Products', 'Low Stock', 'Drafts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === tab ? 'bg-bg-canvas text-text-base' : 'text-text-muted hover:bg-bg-surface-hover hover:text-text-base'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-bg-muted bg-bg-surface focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div ref={scrollContainerRef} className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "600px" }}>
          <table className="w-full text-left border-collapse relative">
            <thead className="sticky top-0 z-10 bg-bg-surface">
              <tr className="border-b border-bg-muted text-xs font-bold text-text-muted uppercase tracking-wider bg-bg-surface">
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">PRICE</th>
                <th className="px-6 py-4">STOCK</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {paddingTop > 0 && !isLoading && (
                <tr><td colSpan={5} style={{ height: paddingTop }} /></tr>
              )}
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={`skeleton-${idx}`} className="border-b border-bg-muted animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-bg-muted flex-shrink-0"></div>
                        <div className="min-w-0">
                          <div className="h-4 bg-bg-muted rounded w-32 mb-1"></div>
                          <div className="h-3 bg-bg-muted rounded w-20"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><div className="h-4 bg-bg-muted rounded w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-bg-muted rounded w-12"></div></td>
                    <td className="px-6 py-4"><div className="h-6 bg-bg-muted rounded-full w-20"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-6 bg-bg-muted rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : virtualItems.map((virtualRow) => {
                const product = filteredProducts[virtualRow.index];
                return (
                  <tr key={product._id} className="border-b border-bg-muted hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-bg-canvas flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <span className="material-symbols-outlined text-text-disabled">image</span>
                          )}
                        </div>
                        <div className='min-w-0'>
                          <div className="truncate font-semibold text-text-base">{product.name}</div>
                          <div className=" truncate text-sm text-text-muted">{product.category[0]?.name || "Uncategorized"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-base">₹{product.price}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`font-semibold ${product.stock === 0 ? 'text-danger' : product.stock <= 5 ? 'text-warning' : 'text-text-base'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleStatus(product._id)}
                          className={`w-11 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${product.isActive ? 'bg-brand-primary' : 'bg-bg-muted'}`}
                        >
                          <div className={`w-4 h-4 bg-bg-surface rounded-full absolute top-1 transition-transform duration-300 ${product.isActive ? 'left-6' : 'left-1'}`} />
                        </button>
                        <span className="text-sm text-text-muted">{product.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => navigate(`/inventory/edit/${product._id}`)}
                          className="p-2 text-text-muted hover:text-text-base hover:bg-bg-surface-hover rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paddingBottom > 0 && (
                <tr><td colSpan={5} style={{ height: paddingBottom }} /></tr>
              )}
              {(!isLoading && filteredProducts.length === 0) && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
};

export default Inventory;