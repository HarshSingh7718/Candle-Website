import React, { useState, useEffect } from 'react';
import { Search, X, Frown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import ProductCard from '../../ui/Cards/ProductCard';
import { useGlobalSearch } from '../../../hooks/useSearch'; // Imported your hook
import { trackSearch } from '../../../utils/metaPixel';

const GlobalSearch = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Logic: Debounce the search term to save API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedTerm(searchTerm);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Logic: Use your TanStack Query hook
  const { data: results = [], isLoading } = useGlobalSearch(debouncedTerm);

  useEffect(() => {
    if (debouncedTerm.trim().length >= 2) {
      trackSearch(debouncedTerm.trim());
    }
  }, [debouncedTerm]);

  // Handle escape key to close and body scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      // FIX: Only clear the search term when the modal actually CLOSES
      setSearchTerm('');
      setDebouncedTerm('');
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Don't unset overflow here, handle it in the else block
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`fixed inset-0 z-[99] transition-all duration-300 ${searchTerm.trim() ? 'bg-white/95 backdrop-blur' : 'bg-black/50'}`}
        onClick={onClose}
      />
      <div className={`fixed top-0 left-0 w-full z-[100] flex flex-col pt-0 transition-opacity duration-300`}>
        <div className="w-full bg-bg-surface border-b border-bg-muted">
          <div className="container mx-auto px-4 h-19 md:h-22 flex items-center justify-between">
            <div className="flex items-center flex-1">
              <Search className={`${isLoading ? 'animate-pulse' : ''} text-text-muted mr-4`} size={24} />
              <input
                type="text"
                className="w-full text-lg md:text-xl font-medium outline-none bg-transparent placeholder-[#333] text-text-base tracking-[0.2em] uppercase"
                placeholder="SEARCH..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchTerm.trim()) {
                    onClose();
                    navigate(`/collections/candles?search=${searchTerm.trim()}`);
                  }
                }}
                autoFocus
              />
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                onClose();
              }}
              className="p-2 ml-4 text-text-disabled hover:text-black transition-colors cursor-pointer"
            >
              <X size={32} strokeWidth={1} />
            </button>
          </div>
        </div>

        {searchTerm.trim().length >= 2 && (
          <div className="flex-1 overflow-y-auto w-full">
            <div className="container mx-auto px-4 py-8 pb-32" style={{ maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
              {results.length > 0 ? (
                <>
                  <div className="flex justify-between items-end mb-8">
                    <p className="text-sm tracking-[0.2em] text-text-muted uppercase font-medium m-0">
                      Top {results.length} Result{results.length !== 1 ? 's' : ''}
                    </p>
                    <Link
                      to={`/collections/candles?search=${searchTerm}`}
                      onClick={onClose}
                      className="text-sm tracking-[0.1em] text-text-base font-semibold uppercase hover:text-primary transition-colors border-b border-text-base hover:border-primary"
                    >
                      View All
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 gap-y-12">
                    {results.map((product) => (
                      <div key={product._id} onClick={onClose} className="cursor-pointer">
                        <ProductCard product={product} />
                      </div>
                    ))}
                  </div>
                </>
              ) : !isLoading && debouncedTerm.length >= 2 && (
                <div className="flex flex-col items-center justify-center mt-32 text-text-disabled">
                  <Frown size={56} strokeWidth={1} className="mb-6 opacity-30" />
                  <p className="text-xl tracking-widest text-[#333] uppercase font-light">No products match your search</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default GlobalSearch;