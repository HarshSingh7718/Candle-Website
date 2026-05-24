import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useUpdateProfile, useUser } from '../../../hooks/useAuth';

const EditProfile = ({ onCancel }) => {
    const { data: user } = useUser();
    const updateProfileMutation = useUpdateProfile();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.firstName.trim()) {
            return toast.error("First name cannot be empty");
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
            return toast.error("Please enter a valid email address");
        }

        updateProfileMutation.mutate(formData, {
            onSuccess: (data) => {
                toast.success("Profile updated successfully!");
                if (onCancel) onCancel();
            }
        });
    };

    return (
        <div className="bg-white rounded-[24px] border border-gray-100 p-6 md:p-8 shadow-sm w-full max-w-2xl mx-auto">
            <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Edit Profile</h2>
                <p className="text-[14px] text-gray-500 mt-1">Update your personal information.</p>
            </header>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-gray-600">First Name</label>
                        <input
                            required
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            type="text"
                            placeholder="John"
                            className="w-full py-2.5 px-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c] transition-all text-[14px]"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-gray-600">Last Name</label>
                        <input
                            required
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            type="text"
                            placeholder="Doe"
                            className="w-full py-2.5 px-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c] transition-all text-[14px]"
                        />
                    </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-gray-600">Email Address</label>
                    <input
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email"
                        placeholder="john@example.com"
                        className="w-full py-2.5 px-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c] transition-all text-[14px]"
                    />
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                    <label className="block text-[13px] font-medium text-gray-600">Mobile Number</label>
                    <input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        type="tel"
                        placeholder="9876543210"
                        className="w-full py-2.5 px-4 bg-[#f9fafb] border border-gray-200 rounded-[16px] focus:outline-none focus:border-[#ea580c] focus:bg-white focus:ring-1 focus:ring-[#ea580c] transition-all text-[14px]"
                    />
                </div>

                {/* Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-gray-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-full sm:w-auto px-6 py-2.5 text-[14px] font-semibold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 hover:bg-gray-50 rounded-[20px] transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={updateProfileMutation.isPending}
                        className="w-full sm:w-auto px-6 py-2.5 bg-black hover:bg-black/85 text-white font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] disabled:bg-gray-400 cursor-pointer"
                    >
                        {updateProfileMutation.isPending ? "Saving Changes..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;