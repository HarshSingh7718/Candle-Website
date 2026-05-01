import { createContext, useState, useContext } from 'react';

const initialCategories = [
  {
    id: 1,
    title: 'Signature Scents',
    productCount: 12,
    description: 'Our core collection of timeless, everyday fragrances crafted for warmth and ambiance.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBi1D22i7X2ucrcoZNLsgEVStqMUOremFeMcxi_E1zKZABa3OF5wyu6rcVy9i13jWPCshIUdJRlwtVySAtLz7RUJhq2itMbEvg5PDxrLLmKIa0m81e3SCpFq2x-iXMyAZeyx1vB5H8oHa9GsQ7Ni9ZpYCKpiEIxg4zJzPW1hhhd59HaAllyXd61AaByioDKkkgLVh7nUudscQkOCV9P7YFAhAw3R3IMakpdHbsdsXSz4b7CRKTyp6EE8eKHNd6TOMp3_YCeKsPaItds',
    status: 'Active'
  },
  {
    id: 2,
    title: 'Seasonal Offerings',
    productCount: 8,
    description: 'Limited edition blends inspired by the changing seasons and holiday traditions.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRPrCI-yLyseKTE31hTOfGbEUdhLu0w2dmjYvIpocDlzbAbSxZiAqrEbaKWFxKZzdoMZRNKDSvne782wEgCqtkfJhyaKzGoi_dPbrWlHSzOQm0Lu3slz-gfOIPk3WwmPTvvIA7SVAVrpNx_pxCYUhoa_u--Xar0RwXQlcnuSkMOsymjJPtaNPEY31IPWGbumeKp-4jzjLKzWfPRay3p3aLoZykc0cBPSLXJicYJN4qAg22yGASh5ybqfb6hWP1yO08FwA5_L7aRKNt',
    status: 'Active'
  },
  {
    id: 3,
    title: 'Botanicals',
    productCount: 0,
    description: 'Earthy, natural blends infused with dried petals, herbs, and essential oils.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlZpFwD7INpJLONmyVtHAC4fuvUPFrIlOg-9OdmmfZF0Xe1wBcuvF06owVk25dGOYwOeBXkXYDgJVP4Prb0U5ndx1mkr5AP2ZdfJKX2Qc2cM6cpjIjIes2jFGRdZDzrMUeie4SBA8chizCRDWoq9ApdNMsVcppCjSz_Veft-fr1r7s9OXlPQnIuzLRAYWe5QCrhHox0pPsR_7kCAhR1J7NBpV2TFaGQaf9fTU1tgLuM4PwwgyNRQw41qn4-Y0PrSECatAWL5Jteafh',
    status: 'Draft'
  }
];

const CategoryContext = createContext();

export const useCategories = () => {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState(initialCategories);

  const addCategory = (newCategory) => {
    setCategories(prev => [...prev, { ...newCategory, id: Date.now(), productCount: 0, status: 'Draft' }]);
  };

  const updateCategory = (id, updatedData) => {
    setCategories(prev => prev.map(c => 
      c.id === id ? { ...c, ...updatedData } : c
    ));
  };

  const deleteCategory = (id) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const toggleStatus = (id) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, status: c.status === 'Active' ? 'Draft' : 'Active' };
      }
      return c;
    }));
  };

  return (
    <CategoryContext.Provider value={{ categories, addCategory, updateCategory, deleteCategory, toggleStatus }}>
      {children}
    </CategoryContext.Provider>
  );
};
