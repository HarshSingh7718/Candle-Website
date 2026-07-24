import React, { useState, useEffect } from 'react';
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { createPortal } from 'react-dom';
import { X, Filter } from 'lucide-react';
import CustomDropdown from './CustomDropdown';

const MobileFilterModal = ({
    isOpen,
    onClose,
    initialSort,
    initialPrice,
    initialCategory,
    categoryOptions,
    onApply
}) => {
    const [sortInput, setSortInput] = useState(initialSort || 'latest');
    const [priceInput, setPriceInput] = useState(initialPrice || 3000);
    const [categoryInput, setCategoryInput] = useState(initialCategory || '');
    const [isMounted, setIsMounted] = useState(false);

    // Handle mounting for animation and state sync
    useEffect(() => {
        let timeout;
        if (isOpen) {
            setSortInput(initialSort || 'latest');
            setPriceInput(initialPrice || 3000);
            setCategoryInput(initialCategory || '');
            setIsMounted(true);
            document.body.style.overflow = 'hidden';
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.paused(true);
        } else {
            timeout = setTimeout(() => setIsMounted(false), 300); // 300ms for exit animation
            document.body.style.overflow = '';
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.paused(false);
        }
        return () => { 
            if (timeout) clearTimeout(timeout);
            document.body.style.overflow = '';
            const smoother = ScrollSmoother.get();
            if (smoother) smoother.paused(false);
        };
    }, [isOpen, initialSort, initialPrice, initialCategory]);

    if (!isMounted && !isOpen) return null;

    const handleApply = () => {
        onApply({ sort: sortInput, maxPrice: priceInput, category: categoryInput });
        onClose();
    };

    const handleReset = () => {
        setSortInput('latest');
        setPriceInput(3000);
        setCategoryInput('');
    };

    const sortOptions = [
        { value: 'latest', label: 'Latest Arrivals' },
        { value: 'popularity', label: 'Most Popular' },
        { value: 'low-to-high', label: 'Price: Low to High' },
        { value: 'high-to-low', label: 'Price: High to Low' },
    ];

    const modalContent = (
        <div className={`fixed inset-0 z-[9999] flex flex-col justify-end lg:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/50" 
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className={`relative bg-bg-surface w-full rounded-t-2xl shadow-xl flex flex-col max-h-[85vh] transition-transform duration-300 ease-out pb-4 sm:pb-8 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-bg-muted">
                    <h2 className="text-xl font-semibold flex items-center gap-2 text-text-base">
                        <Filter size={20} />
                        Filters & Sort
                    </h2>
                    <button onClick={onClose} className="p-2 text-text-muted hover:bg-bg-surface-hover rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    
                    {/* Sort Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-4 text-text-base flex items-center gap-2">
                            Sort By
                        </h3>
                        <div className="space-y-3">
                            {sortOptions.map((option) => (
                                <label 
                                    key={option.value} 
                                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                                        sortInput === option.value 
                                            ? 'border-brand-primary bg-brand-primary/5 text-brand-primary' 
                                            : 'border-bg-muted hover:bg-bg-surface-hover text-text-base'
                                    }`}
                                >
                                    <input 
                                        type="radio" 
                                        name="sort" 
                                        value={option.value}
                                        checked={sortInput === option.value}
                                        onChange={() => setSortInput(option.value)}
                                        className="hidden"
                                    />
                                    <span className="flex-1 font-medium">{option.label}</span>
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                        sortInput === option.value ? 'border-brand-primary' : 'border-text-disabled'
                                    }`}>
                                        {sortInput === option.value && <div className="w-2.5 h-2.5 bg-brand-primary rounded-full" />}
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-bg-muted w-full" />

                    {/* Collection Filter Section */}
                    {categoryOptions && (
                        <div>
                            <h3 className="text-lg font-medium mb-4 text-text-base flex items-center gap-2">
                                Collection
                            </h3>
                            <CustomDropdown
                              options={categoryOptions}
                              value={categoryInput}
                              onChange={setCategoryInput}
                            />
                        </div>
                    )}

                    <div className="h-px bg-bg-muted w-full" />

                    {/* Price Filter Section */}
                    <div>
                        <h3 className="text-lg font-medium mb-4 text-text-base flex items-center gap-2 justify-between">
                            Price Range
                            <span className="text-sm font-normal text-text-muted">
                                Up to ₹{priceInput}
                            </span>
                        </h3>
                        <div className="px-2">
                            <input
                                type="range"
                                min="0"
                                max="3000"
                                value={priceInput}
                                onChange={(e) => setPriceInput(Number(e.target.value))}
                                className="w-full accent-brand-primary cursor-pointer h-2 bg-bg-muted rounded-lg appearance-none"
                            />
                            <div className="flex justify-between text-sm mt-3 font-medium text-text-muted">
                                <span>₹0</span>
                                <span>₹3000</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-bg-muted bg-bg-surface flex gap-3">
                    <button 
                        onClick={handleReset}
                        className="flex-1 py-3.5 px-4 rounded-xl border border-bg-muted text-text-base font-semibold hover:bg-bg-surface-hover transition-colors"
                    >
                        Reset
                    </button>
                    <button 
                        onClick={handleApply}
                        className="flex-1 py-3.5 px-4 rounded-xl bg-brand-primary text-text-on-brand font-semibold hover:bg-brand-secondary transition-colors"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>
        </div>
    );

    return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default MobileFilterModal;
