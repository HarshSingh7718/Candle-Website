import { createContext, useState, useContext } from 'react';

const initialBanners = [
  {
    id: 1,
    title: 'Seasonal Summer Sale',
    subtitle: 'Hero Section • Ends Aug 31',
    status: 'Active',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBlYvYTGRiZGtFZbmXLGgD3dgeq6i0hAcf4sdBpIR5Gj_uzTgpis6t4Qt1PWhrzTBCeRyb1Eb-Vk4xVIcpjiT1EYaJs_tajeckPlD_d1vuym63_BCOWsDD2kbOkqP0kvvzO46oRC-KSeP0IrKRZ6LbAtZNOZqlUwQJcil-pa-tglo06qzzJu1NGP_pKkOxbvxLF9m68Zyvx_TfvTDuzEBR68pe74j0NazI-2psLN1CKFGcowqsQiH7GSKD0YZgoU3wxCqKgRUraNRSz',
  },
  {
    id: 2,
    title: 'Hand-poured Classics',
    subtitle: 'Category Header • Signature Line',
    status: 'Draft',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCJLJUlWtoPLzdFHnXBfl81APcobHZcgEr0BtTJr9ZrV1_JIcLc86exfq35ROLNYAcxsD8ptVExUOL9fJNg8nxK-O-m-DOum0ykDHRfUinW4Ce37xOfQUYHo9jNidPtBwL9Lu86FnzD9moVhylsVqHMywbCtqO2crCPL-OKbthm6OtFdJdPJDbwzr4UQ4jAWoZkBB2_U3dlCiZeerwiQYDmKd3gMoyaRVJREZVqK9DN6cqjL3pYURbyHXHVCr6KGJAj6Lk4yJda9htj',
  }
];

const BannerContext = createContext();

export const useBanners = () => {
  const context = useContext(BannerContext);
  if (!context) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
};

export const BannerProvider = ({ children }) => {
  const [banners, setBanners] = useState(initialBanners);

  const addBanner = (newBanner) => {
    setBanners(prev => [...prev, { ...newBanner, id: Date.now(), status: 'Draft' }]);
  };

  const updateBanner = (id, updatedData) => {
    setBanners(prev => prev.map(banner => 
      banner.id === id ? { ...banner, ...updatedData } : banner
    ));
  };

  const deleteBanner = (id) => {
    setBanners(prev => prev.filter(banner => banner.id !== id));
  };

  const toggleStatus = (id) => {
    setBanners(prev => prev.map(banner => {
      if (banner.id === id) {
        return { ...banner, status: banner.status === 'Active' ? 'Draft' : 'Active' };
      }
      return banner;
    }));
  };

  return (
    <BannerContext.Provider value={{ banners, addBanner, updateBanner, deleteBanner, toggleStatus }}>
      {children}
    </BannerContext.Provider>
  );
};
