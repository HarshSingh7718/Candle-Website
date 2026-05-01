import { createContext, useState, useContext } from 'react';

const initialOptions = [
  // Scents (Tab 1)
  {
    id: 1,
    tabId: 1,
    name: 'Lavender & Silk',
    desc: 'A calming blend of French lavender, subtle chamomile, and smooth vanilla undertones.',
    price: 0,
    stock: 100,
    status: 'Active',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDc7cwGFBKdJzJffqORWED5CKtqcGZhNpBLMxgALa-wkrvJVqoM1moqNUCmYq3sBWCZtA2DT1Wm5rWedcvyLlpoUFyRXc_i5dfuVHSyCvb5j6F65rkIVHDjFRr7tGikto6XxclJgSrI-NVxDvhpqje43ir50KdGMDvkO91QY3rj5jiaPU6yijQy2a4BUL9DN5Lv822ZHLK-whDP9qsw6fztViq3FBZ5n09yAozcUYiDHCMcjhHBXcltqgfrH0yHmZFRI1ZVaryruP0J'
  },
  {
    id: 2,
    tabId: 1,
    name: 'Vintage Amber',
    desc: 'Rich, resinous amber mixed with dark patchouli and a hint of smoked oakwood.',
    price: 5,
    stock: 50,
    status: 'Active',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpt5AyCWilM36Ok6Y_OoSKPwN-SnsBaaRNeonpnXJ4IvsA-9M2qBY0dZuDGvKvtNqK5psq9sLhUbewWXAkz3QXj7MXUM7bFd8Df96_RkZ_WIN1qYfOg4d0aTbhOFlv0qBraMnjGsEwrU3yDlXJAdVLoDcgEvp1X3P5rmiKH2Krm2hWyBYdHTrMU8V6DR3orbKy8wZPU3sYpTLHzIYLsE98QfIkDntipuY0WMsPrqvvOO74RsoP8fTtviTxibSN7HQ4ySt_rJLMamxO'
  },
  {
    id: 3,
    tabId: 1,
    name: 'Citrus Grove',
    desc: 'Bright bergamot, sweet orange zest, and a subtle herbaceous basil finish.',
    price: 0,
    stock: 75,
    status: 'Hidden',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDHafmHoJmlbRhbTJgNC_9O_7_b6sV2s3iuZyfEVcLWYEo8vVr5QrEkB3yq5IKDfcNGg2O-xI2AS4x5pBztJQKhowLE07X76DkPiOEeKUiShAZlddvM4Te1-_DHDCZhcuJXQzbqtuGcmoWCdmn8sDutcl7sTxx0kEPPnbr5xFIQ8KzOBuSXDdcYhEdQRriiIXL90o9HqbEr_WhUMfmY2pF8uUR6av7JdpDVQbpTzJIp77c0oUCyRw9oPipVRJrl7H65PXZn9ILKwK8O'
  },
  // Toppings (Tab 3)
  {
    id: 4,
    tabId: 3,
    name: 'Dried Botanicals',
    desc: 'Hand-picked organic dried flower petals and herbs for a natural finish.',
    price: 0,
    stock: 200,
    status: 'Active',
    img: 'https://images.unsplash.com/photo-1595981267035-7b04d9b4b08b?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 5,
    tabId: 3,
    name: 'Gold Leaf',
    desc: 'Elegant 24k edible gold leaf for a shimmering, luxurious surface effect.',
    price: 3,
    stock: 20,
    status: 'Active',
    img: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?q=80&w=2071&auto=format&fit=crop'
  },
  {
    id: 6,
    tabId: 3,
    name: 'Crystal Stones',
    desc: 'Ethically sourced raw crystals to infuse energy and intention.',
    price: 5,
    stock: 15,
    status: 'Hidden',
    img: 'https://images.unsplash.com/photo-1587301669865-98305c48834f?q=80&w=2028&auto=format&fit=crop'
  }
];

const OptionContext = createContext();

export const useOptions = () => {
  const context = useContext(OptionContext);
  if (!context) {
    throw new Error('useOptions must be used within an OptionProvider');
  }
  return context;
};

export const OptionProvider = ({ children }) => {
  const [options, setOptions] = useState(initialOptions);

  const addOption = (newOption) => {
    setOptions(prev => [...prev, { ...newOption, id: Date.now(), status: 'Active' }]);
  };

  const updateOption = (id, updatedData) => {
    setOptions(prev => prev.map(o => 
      o.id === id ? { ...o, ...updatedData } : o
    ));
  };

  const deleteOption = (id) => {
    setOptions(prev => prev.filter(o => o.id !== id));
  };

  const toggleStatus = (id) => {
    setOptions(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: o.status === 'Active' ? 'Hidden' : 'Active' };
      }
      return o;
    }));
  };

  return (
    <OptionContext.Provider value={{ options, addOption, updateOption, deleteOption, toggleStatus }}>
      {children}
    </OptionContext.Provider>
  );
};
