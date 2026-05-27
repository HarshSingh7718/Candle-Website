import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGetCategoryProducts, useUpdateCategoryProducts } from '../hooks/useCategories';

const CategoryProducts = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const mainRef = useRef(null);

  const { data, isLoading } = useGetCategoryProducts(id);
  const { mutate: updateAssignments, isPending } = useUpdateCategoryProducts();

  // State to track selected product IDs
  const [selectedProducts, setSelectedProducts] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  // Initialize selected products when data loads
  useEffect(() => {
    if (data?.products) {
      const assignedIds = data.products
        .filter(p => p.assigned)
        .map(p => p._id);
      setSelectedProducts(new Set(assignedIds));
    }
  }, [data]);

  useEffect(() => {
    if (!isLoading) {
      gsap.fromTo(mainRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" });
    }
  }, [isLoading]);

  const handleToggleProduct = (productId) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSave = () => {
    updateAssignments({
      categoryId: id,
      productIds: Array.from(selectedProducts)
    });
  };

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const filteredProducts = data?.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="mb-stack-lg flex-shrink-0">
        <button onClick={() => navigate('/categories')} className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md mb-4 cursor-pointer">
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Back to Categories
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="font-heading text-headline-xl text-on-surface mb-2">
                Manage Products: <span className="text-primary">{data?.category?.name}</span>
                </h2>
                <p className="font-body-lg text-secondary">
                Assign or remove products for this category. Selected products will appear when users browse this category.
                </p>
            </div>
            
            <button 
                onClick={handleSave} 
                disabled={isPending}
                className="px-8 py-3 bg-primary text-on-primary font-heading text-headline-md rounded-lg shadow-[0_2px_0_rgba(141,75,0,0.3)] hover:bg-primary-container active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
                {isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-on-primary"></div>
                ) : (
                    <span className="material-symbols-outlined text-[20px]">save</span>
                )}
                Save Changes
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-stack-md flex-shrink-0">
         <div className="relative max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input 
                type="text" 
                placeholder="Search products by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
            />
         </div>
      </div>

      {/* Products List (Scrollable) */}
      <div className="flex-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
          <div className="overflow-y-auto p-4 space-y-2 flex-1">
             {filteredProducts.length > 0 ? (
                 filteredProducts.map(product => {
                     const isSelected = selectedProducts.has(product._id);
                     return (
                        <div 
                            key={product._id} 
                            onClick={() => handleToggleProduct(product._id)}
                            className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                                isSelected 
                                ? 'bg-primary/5 border-primary/30 shadow-sm' 
                                : 'bg-surface-container-low border-transparent hover:bg-surface-container'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="flex-shrink-0">
                                <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // handled by parent div onClick
                                    className="w-6 h-6 border-2 border-outline-variant rounded text-primary focus:ring-primary/20 accent-primary pointer-events-none"
                                />
                            </div>

                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-lg bg-surface-dim overflow-hidden flex-shrink-0 border border-outline-variant/20">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-symbols-outlined text-on-surface-variant/50">image</span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1">
                                <h3 className={`font-heading text-headline-sm ${isSelected ? 'text-primary' : 'text-on-surface'}`}>
                                    {product.name}
                                </h3>
                                <p className="font-label-sm text-secondary">
                                    Slug: {product.slug}
                                </p>
                            </div>
                        </div>
                     );
                 })
             ) : (
                 <div className="py-12 text-center text-on-surface-variant font-body-md">
                    No products found.
                 </div>
             )}
          </div>
      </div>
    </main>
  );
};

export default CategoryProducts;
