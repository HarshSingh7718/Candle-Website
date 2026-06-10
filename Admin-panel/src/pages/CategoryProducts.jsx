import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import gsap from 'gsap';
import { useGetCategoryProducts, useUpdateCategoryProducts } from '../hooks/useCategories';

import { ArrowLeft, Save, Search, Image } from 'lucide-react';

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
    return <div className="flex-1 flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div></div>;
  }

  const filteredProducts = data?.products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <main ref={mainRef} className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full opacity-0 flex flex-col h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="mb-stack-lg flex-shrink-0">
        <button onClick={() => navigate('/categories')} className="flex items-center gap-2 text-text-muted hover:text-brand-primary transition-colors font-label-md text-label-md mb-4 cursor-pointer">
          <ArrowLeft className=" text-[20px]" />
          Back to Categories
        </button>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="font-heading text-headline-xl text-text-base mb-2">
                Manage Products: <span className="text-brand-primary">{data?.category?.name}</span>
                </h2>
                <p className="font-body-lg text-secondary">
                Assign or remove products for this category. Selected products will appear when users browse this category.
                </p>
            </div>
            
            <button 
                onClick={handleSave} 
                disabled={isPending}
                className="px-8 py-3 bg-brand-primary text-text-on-brand font-heading text-headline-md rounded-lg shadow-[0_2px_0_rgba(141,75,0,0.3)] hover:bg-coffee-800 active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
                {isPending ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-text-on-brand"></div>
                ) : (
                    <Save className=" text-[20px]" />
                )}
                Save Changes
            </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-stack-md flex-shrink-0">
         <div className="relative max-w-md">
            <Search className=" absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input 
                type="text" 
                placeholder="Search products by name..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-bg-canvas border border-bg-muted rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none transition-all font-body-md"
            />
         </div>
      </div>

      {/* Products List (Scrollable) */}
      <div className="flex-1 bg-bg-surface border border-bg-muted/30 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-0">
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
                                ? 'bg-brand-primary/5 border-brand-primary/30 shadow-sm' 
                                : 'bg-bg-canvas border-transparent hover:bg-bg-muted'
                            }`}
                        >
                            {/* Checkbox */}
                            <div className="flex-shrink-0">
                                <input 
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // handled by parent div onClick
                                    className="w-6 h-6 border-2 border-bg-muted rounded text-brand-primary focus:ring-brand-primary/20 accent-primary pointer-events-none"
                                />
                            </div>

                            {/* Product Image */}
                            <div className="w-16 h-16 rounded-lg bg-bg-surface-dim overflow-hidden flex-shrink-0 border border-bg-muted/20">
                                {product.image ? (
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Image className=" text-text-muted/50" />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-heading text-headline-sm truncate ${isSelected ? 'text-brand-primary' : 'text-text-base'}`}>
                                    {product.name}
                                </h3>
                                <p className="font-label-sm text-secondary truncate">
                                    Slug: {product.slug}
                                </p>
                            </div>
                        </div>
                     );
                 })
             ) : (
                 <div className="py-12 text-center text-text-muted font-body-md">
                    No products found.
                 </div>
             )}
          </div>
      </div>
    </main>
  );
};

export default CategoryProducts;
