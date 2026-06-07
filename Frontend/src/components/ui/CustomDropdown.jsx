import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ value, onChange, options, className = '' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find((opt) => opt.value === value) || options[0];

    return (
        <div className={`relative w-full ${className}`} ref={dropdownRef}>
            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between bg-bg-surface border transition-colors px-4 py-2.5 rounded-md outline-none cursor-pointer text-text-base ${
                    isOpen ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-bg-muted hover:border-text-disabled'
                }`}
            >
                <span className="truncate pr-2">{selectedOption?.label}</span>
                <ChevronDown 
                    className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-bg-surface border border-bg-muted rounded-md shadow-lg py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-60 overflow-auto hide-scrollbar">
                        {options.map((option) => {
                            const isSelected = option.value === value;
                            return (
                                <li
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`px-4 py-2.5 cursor-pointer flex items-center justify-between transition-colors ${
                                        isSelected 
                                            ? 'bg-brand-primary/5 text-brand-primary font-medium' 
                                            : 'text-text-base hover:bg-bg-surface-hover'
                                    }`}
                                >
                                    <span className="truncate">{option.label}</span>
                                    {isSelected && <Check className="w-4 h-4 text-brand-primary" />}
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CustomDropdown;
