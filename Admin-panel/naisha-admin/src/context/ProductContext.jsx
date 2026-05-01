import { createContext, useState, useContext } from 'react';

const initialProducts = [
  {
    id: 1,
    name: 'Midnight Fig & Cedar',
    collection: 'Signature Collection',
    price: 48.00,
    stock: 12,
    maxStock: 50,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDd-BTatV2H_bHyhSUbwCBpH-aZb-yB_UT8NQNJAC-6A164Jk7rhe4GySqZvI5B15ClhHReSbRc3tKhZWNHGfQObC3idWlXenlm1WMCbga5X4pg3uV_bnOEdSwOUhIaJxJDfVEud6XZoVGSYntuTGJSeHvLoNJl5Uvsh6oqrE3MJ0BpBLziEBSj0n6jSB96EYUGSl9RTVAq1lnqsEOyJQlVAR1c0AEoos5tm2RjuMSSOeOym94VBp6rdM9tfb0wyxpEaqZ1E0N7d3yL'
  },
  {
    id: 2,
    name: 'Sandalwood & Rose',
    collection: 'Botanical Series',
    price: 42.00,
    stock: 45,
    maxStock: 50,
    status: 'Active',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA_Ip3nbB7jEQqFnn-8TswAfoKcI8T3ug84caVR5lmsYsKvq2U8GICRw1VX6q4NVcC8C3af4ghB-K9wWrLeUPz8Fw3ATFzrq9thvIvNudwy0ZuDbAFE8NBbSYekoR82l3tBN0XD0jsJrIuBXBatCcgcYcSf4NoVP2oLVxSiggo4e23mWW7IdahP5Ksi4Mzzb3RVyYFOdqJZeTRD-2hUeADAwnK4jHM4jS3Z76k5ihTmT_9I5GjZZr7mHaswUR6v4UZASV_7SX9M50sF'
  },
  {
    id: 3,
    name: 'Vetiver & Smoke',
    collection: 'Limited Edition',
    price: 55.00,
    stock: 0,
    maxStock: 20,
    status: 'Draft',
    image: ''
  },
  {
    id: 4,
    name: 'Bergamot & Basil',
    collection: 'Signature Collection',
    price: 48.00,
    stock: 28,
    maxStock: 50,
    status: 'Active',
    image: ''
  }
];

const ProductContext = createContext();

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);

  const addProduct = (newProduct) => {
    setProducts(prev => [...prev, { ...newProduct, id: Date.now(), maxStock: 100, status: 'Draft' }]);
  };

  const updateProduct = (id, updatedData) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updatedData } : p
    ));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const toggleStatus = (id) => {
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'Active' ? 'Draft' : 'Active' };
      }
      return p;
    }));
  };

  return (
    <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, toggleStatus }}>
      {children}
    </ProductContext.Provider>
  );
};
