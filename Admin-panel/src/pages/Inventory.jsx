import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { useGetProducts, useDeleteProduct, useToggleProductStatus } from '../hooks/useProducts';

const Inventory = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All Products');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useGetProducts();
  const { mutate: deleteProduct } = useDeleteProduct();
  const { mutate: toggleStatus } = useToggleProductStatus();

  const mainRef = useRef(null);
  const tableRef = useRef(null);
  const rowsRef = useRef([]);

  useEffect(() => {
    if (isLoading) return;
    gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    if (rowsRef.current.length > 0) {
      gsap.fromTo(rowsRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: "power2.out", delay: 0.4 });
    }
  }, [products.length, isLoading]);

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

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-8 opacity-0">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="font-heading text-headline-xl text-on-background mb-2">Inventory Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Manage your artisan candle collection, track stock levels, and update product details.
          </p>
        </div>
        <button
          onClick={() => navigate('/inventory/add')}
          className="px-6 py-3 rounded-md bg-[#8d4b00] text-white font-label-md text-label-md hover:bg-[#b15f00] transition-colors duration-200 cursor-pointer flex items-center gap-2 whitespace-nowrap"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Product
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant overflow-hidden" ref={tableRef}>

        {/* Toolbar: Tabs & Search */}
        <div className="p-6 border-b border-surface-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-2">
            {['All Products', 'Low Stock', 'Drafts'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${activeTab === tab ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
              <input
                type="text"
                placeholder="Search inventory..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-md border border-outline-variant bg-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-surface-variant bg-surface-container-lowest text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                <th className="px-6 py-4">PRODUCT NAME</th>
                <th className="px-6 py-4">PRICE</th>
                <th className="px-6 py-4">STOCK</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product._id} ref={addToRowsRef} className="border-b border-surface-variant hover:bg-surface-container-low transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-md bg-surface-container-high flex items-center justify-center overflow-hidden flex-shrink-0">
                        {product.images?.[0] ? (
                          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-outline">image</span>
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{product.name}</div>
                        <div className="text-sm text-on-surface-variant">{product.category?.name || "Uncategorized"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-on-surface">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`font-semibold ${product.stock === 0 ? 'text-error' : product.stock <= 5 ? 'text-[#b15f00]' : 'text-on-surface'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleStatus(product._id)}
                        className={`w-11 h-6 rounded-full relative transition-colors duration-300 cursor-pointer ${product.isActive ? 'bg-[#8d4b00]' : 'bg-surface-dim'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-300 ${product.isActive ? 'left-6' : 'left-1'}`} />
                      </button>
                      <span className="text-sm text-on-surface-variant">{product.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/inventory/edit/${product._id}`)}
                        className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-md transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => deleteProduct(product._id)}
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-md transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-on-surface-variant">No products found.</td>
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