import React, { useState, useEffect } from 'react';
import { useSettings, useUpdateSettings } from '../hooks/useSettings';
import toast from 'react-hot-toast';

const StoreSettings = () => {
    const { data: settings, isLoading } = useSettings();
    const updateSettingsMutation = useUpdateSettings();

    const [formData, setFormData] = useState({
        deliveryCharges: 99,
        freeDeliveryThreshold: 999,
        baseCustomisationCharges: 100,
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                deliveryCharges: settings.deliveryCharges,
                freeDeliveryThreshold: settings.freeDeliveryThreshold,
                baseCustomisationCharges: settings.baseCustomisationCharges,
            });
        }
    }, [settings]);

    const handleChange = (e) => {
        const value = e.target.value === '' ? '' : Number(e.target.value);
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (formData.deliveryCharges < 0 || formData.freeDeliveryThreshold < 0 || formData.baseCustomisationCharges < 0) {
            return toast.error("Charges cannot be negative");
        }

        updateSettingsMutation.mutate(formData);
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-[300px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 max-w-2xl">
            <h3 className="text-lg font-bold mb-2 text-on-surface">Pricing & Delivery Configuration</h3>
            <p className="text-sm text-on-surface-variant mb-6">
                Update store-wide pricing rules. Changes will reflect immediately for all users.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Delivery Charges */}
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-on-surface">Base Delivery Charge</label>
                        <span className="material-symbols-outlined text-primary">local_shipping</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">
                        The flat shipping fee applied to orders below the free delivery threshold.
                    </p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
                        <input
                            type="number"
                            name="deliveryCharges"
                            value={formData.deliveryCharges}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-8 pr-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary font-medium"
                        />
                    </div>
                </div>

                {/* Free Delivery Threshold */}
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-on-surface">Free Delivery Threshold</label>
                        <span className="material-symbols-outlined text-primary">shopping_bag</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">
                        Orders with a subtotal greater than or equal to this amount will receive free shipping.
                    </p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
                        <input
                            type="number"
                            name="freeDeliveryThreshold"
                            value={formData.freeDeliveryThreshold}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-8 pr-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary font-medium"
                        />
                    </div>
                </div>

                {/* Base Customisation Charge */}
                <div className="bg-surface-container-low rounded-lg p-4 border border-outline-variant/30">
                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold text-on-surface">Base Customisation Fee</label>
                        <span className="material-symbols-outlined text-primary">auto_awesome</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mb-3">
                        The standard add-on cost applied when a customer selects a custom candle variant.
                    </p>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-medium">₹</span>
                        <input
                            type="number"
                            name="baseCustomisationCharges"
                            value={formData.baseCustomisationCharges}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-8 pr-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary font-medium"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={updateSettingsMutation.isPending}
                    className="bg-[#8d4b00] text-white px-6 py-2.5 rounded-md hover:bg-[#b15f00] transition-colors disabled:opacity-50 font-medium shadow-sm"
                >
                    {updateSettingsMutation.isPending ? "Saving changes..." : "Save Store Settings"}
                </button>
            </form>
        </div>
    );
};

export default StoreSettings;
