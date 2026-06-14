import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGetProducts, useDeleteProduct, useToggleProductStatus } from '../hooks/useProducts';
import TableSkeleton from '../components/Skeletons/TableSkeleton';

import { Plus, Search, Image, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';

const Inventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, debouncedSearch]);

  const { data, isLoading, isFetching } = useGetProducts(page, limit, debouncedSearch, activeTab);
  const products = data?.products || [];
  const totalPages = data?.totalPages || 1;

  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const mainRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
  }, []);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

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
          <Plus className=" text-[18px]" />
          Add Product
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`bg-bg-surface rounded-xl shadow-sm border border-bg-muted overflow-hidden transition-opacity duration-200 ${isFetching && !isLoading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`} ref={tableRef}>

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
              <Search className=" absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-[20px]" />
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
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse relative min-w-[800px]">
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
              {isLoading ? (
                <TableSkeleton rows={10} cols={5} />
              ) : products.length > 0 ? (
                products.map((product) => (
                  <tr key={product._id} className="border-b border-bg-muted hover:bg-bg-surface-hover transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-md bg-bg-canvas flex items-center justify-center overflow-hidden flex-shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <Image className=" text-text-disabled" />
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
                          <Pencil className=" text-[20px]" />
                        </button>
                        <button
                          onClick={() => deleteProduct(product._id)}
                          className="p-2 text-text-muted hover:text-danger hover:bg-danger/10 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className=" text-[20px]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-text-muted">No products found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-bg-muted flex items-center justify-between bg-bg-surface">
            <span className="text-sm text-text-muted">
              Showing page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className=" text-[18px]" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 rounded border text-sm font-medium transition-colors ${
                    pageNum === page
                      ? 'bg-brand-primary text-white border-brand-primary'
                      : 'border-bg-muted text-text-muted hover:bg-bg-surface-hover'
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="p-2 rounded border border-bg-muted text-text-muted hover:bg-bg-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className=" text-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default Inventory;