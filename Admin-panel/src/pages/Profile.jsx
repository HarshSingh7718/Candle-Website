import React, { useState, useEffect } from 'react';
import { useAdminProfile, useUpdateAdminProfile, useChangeAdminPassword } from '../hooks/useProfile';
import toast from 'react-hot-toast';

const Profile = () => {
    const { data: user, isLoading } = useAdminProfile();
    const updateProfile = useUpdateAdminProfile();
    const changePassword = useChangeAdminPassword();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
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

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        updateProfile.mutate(formData);
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        if (!passwordData.oldPassword || !passwordData.newPassword) {
            toast.error("Please fill in both password fields");
            return;
        }
        changePassword.mutate(passwordData, {
            onSuccess: () => {
                setPasswordData({ oldPassword: '', newPassword: '' });
            }
        });
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <main className="p-gutter md:p-margin-page max-w-container-max mx-auto w-full space-y-8">
            <div>
                <h2 className="font-heading text-headline-xl text-on-background mb-2">Admin Profile</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                    Manage your personal information and security settings.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Info Form */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6">
                    <h3 className="text-lg font-bold mb-6 text-on-surface">Personal Information</h3>
                    <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleFormChange}
                                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="mt-4 bg-[#8d4b00] text-white px-6 py-2 rounded-md hover:bg-[#b15f00] transition-colors disabled:opacity-50"
                        >
                            {updateProfile.isPending ? "Saving..." : "Save Profile"}
                        </button>
                    </form>
                </div>

                {/* Change Password Form */}
                <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-surface-variant p-6 h-fit">
                    <h3 className="text-lg font-bold mb-6 text-on-surface">Change Password</h3>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">Current Password</label>
                            <input
                                type="password"
                                name="oldPassword"
                                value={passwordData.oldPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-on-surface-variant mb-1">New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                className="w-full px-4 py-2 border border-outline-variant rounded-md bg-surface text-on-surface focus:outline-none focus:border-primary"
                                placeholder="••••••••"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={changePassword.isPending}
                            className="mt-4 bg-black text-white px-6 py-2 rounded-md hover:bg-black/80 transition-colors disabled:opacity-50"
                        >
                            {changePassword.isPending ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
};

export default Profile;
