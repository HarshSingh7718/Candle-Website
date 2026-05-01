import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import MainBtn from '../../ui/Buttons/MainBtn';
import { useAddress } from '../../../hooks/useAddress';

const Addresses = () => {
    const { user } = useOutletContext();
    const addresses = user?.addresses || [];

    const { addAddress, updateAddress, deleteAddress, isAdding, isUpdating } = useAddress();

    // State to toggle between the list view and the form view
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', phone: '', address: '', city: '', state: '', pincode: '', isDefault: false
    });

    const handleOpenForm = (address = null) => {
        if (address) {
            setFormData(address);
            setEditingId(address._id);
        } else {
            setFormData({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phoneNumber || '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                isDefault: addresses.length === 0 // Make default automatically if it's the first one
            });
            setEditingId(null);
        }
        setShowForm(true);
    };

    const handleCloseForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); 

        try {
            if (editingId) {
                // Update existing
                await updateAddress({ addressId: editingId, addressData: formData });
            } else {
                // Add new
                await addAddress(formData);
            }
            // Close form only if successful
            handleCloseForm();
        } catch (error) {
            console.error("Submission failed", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this address?")) {
            try {
                await deleteAddress(id);
            } catch (error) {
                console.error("Deletion failed", error);
            }
        }
    };

    const isSubmitting = isAdding || isUpdating;

    // ==========================================
    // RENDER: FORM VIEW
    // ==========================================
    if (showForm) {
        return (
            <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                    <h4 className="text-xl font-semibold text-heading">
                        {editingId ? "Edit Address" : "Add New Address"}
                    </h4>
                    <button onClick={handleCloseForm} className="text-sm text-paragraph hover:text-black underline">
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">First Name</label>
                            <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">Last Name</label>
                            <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="block text-[13px] font-medium text-gray-600">Street Address</label>
                            <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="House number and street name" className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">City</label>
                            <input required name="city" value={formData.city} onChange={handleChange} type="text" className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">State</label>
                            <input required name="state" value={formData.state} onChange={handleChange} type="text" className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">Pincode / ZIP</label>
                            <input required name="pincode" value={formData.pincode} onChange={handleChange} type="text" maxLength={6} className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-gray-600">Mobile Number</label>
                            <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" maxLength={10} className="w-full py-2.5 px-4 bg-white border border-gray-200 rounded-sm focus:outline-none focus:border-gray-400 text-[14px]" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4">
                        <input
                            type="checkbox"
                            id="isDefault"
                            name="isDefault"
                            checked={formData.isDefault}
                            onChange={handleChange}
                            className="w-4 h-4 text-black border-gray-300 rounded focus:ring-black accent-black"
                        />
                        <label htmlFor="isDefault" className="text-[14px] text-gray-600 cursor-pointer">
                            Set as default shipping address
                        </label>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-8 py-3 bg-black hover:bg-gray-900 text-white font-bold rounded-sm text-[14px] transition-all disabled:bg-gray-400"
                        >
                            {isSubmitting ? "Saving..." : (editingId ? "Update Address" : "Save Address")}
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // ==========================================
    // RENDER: LIST VIEW
    // ==========================================
    return (
        <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h4 className="text-xl font-semibold text-heading">Saved Addresses</h4>
                <button
                    onClick={() => handleOpenForm()}
                    className="flex items-center gap-1 text-sm font-semibold text-[#ea580c] hover:text-[#c2410c] transition-colors"
                >
                    <Plus size={16} /> Add New
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center">
                    <MapPin size={48} className="text-gray-300 mb-4" />
                    <p className="text-paragraph mb-4">You haven't saved any addresses yet.</p>
                    <MainBtn onClick={() => handleOpenForm()} type="button" text="Add New Address" className="bg-black! text-white! rounded-sm! shadow-none!" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((addr) => (
                        <div key={addr._id} className={`relative p-6 border rounded-sm transition-all ${addr.isDefault ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}>

                            {addr.isDefault && (
                                <span className="absolute -top-3 left-4 bg-black text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Default
                                </span>
                            )}

                            <address className="not-italic text-[14px] text-gray-600 space-y-1 mb-4 mt-2">
                                <p className="font-semibold text-black text-[15px] mb-2">{addr.firstName} {addr.lastName}</p>
                                <p>{addr.address}</p>
                                <p>{addr.city}, {addr.state} {addr.pincode}</p>
                                <p className="pt-2">Mobile: +91 {addr.phone}</p>
                            </address>

                            <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => handleOpenForm(addr)}
                                    className="flex items-center gap-1 text-[13px] font-medium text-gray-500 hover:text-black transition-colors"
                                >
                                    <Edit2 size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(addr._id)}
                                    className="flex items-center gap-1 text-[13px] font-medium text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Addresses;