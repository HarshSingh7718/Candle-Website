import React, { useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import MainBtn from '../../ui/Buttons/MainBtn';
import EditProfile from './EditProfile';
import { useChangePassword } from '../../../hooks/useAuth'; // 👉 Imported password hook

const Profile = () => {
    const { user } = useOutletContext();
    const [isEditing, setIsEditing] = useState(false);

    // 👉 State for the new password section
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
    });

    const changePasswordMutation = useChangePassword();

    const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();

        if (passwordData.newPassword.length < 6) {
            return toast.error("New password must be at least 6 characters");
        }

        changePasswordMutation.mutate(passwordData, {
            onSuccess: () => {
                toast.success("Password updated successfully!");
                setIsChangingPassword(false);
                setPasswordData({ oldPassword: '', newPassword: '' });
            }
        });
    };

    if (isEditing) {
        return <EditProfile onCancel={() => setIsEditing(false)} />;
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Account Details Card */}
            <div className="bg-bg-surface p-8 border border-bg-muted shadow-sm rounded-sm">
                <h4 className="text-xl font-semibold mb-6 border-b border-bg-muted pb-3 text-heading">Account Details</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm text-paragraph mb-1">Full Name</p>
                        <p className="font-medium text-heading">{user?.firstName} {user?.lastName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-paragraph mb-1">Email Address</p>
                        <p className="font-medium text-heading">{user?.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-paragraph mb-1">Mobile Number</p>
                        <div className="flex items-center gap-2">
                            <p className="font-medium text-heading">{user?.phoneNumber ? `+91 ${user.phoneNumber}` : 'Not provided'}</p>
                            {user?.phoneNumber && !user?.isPhoneVerified && (
                                <span className="text-[10px] bg-red-100 text-danger px-2 py-0.5 rounded-full font-bold">Unverified</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <MainBtn
                        type="button"
                        text="Edit Profile"
                        onClick={() => setIsEditing(true)}
                        className="bg-primary! text-white! rounded-sm! shadow-none!"
                    />
                </div>
            </div>

            {/* 👉 NEW: Change Password Card */}
            <div className="bg-bg-surface p-8 border border-bg-muted shadow-sm rounded-sm">
                <h4 className="text-xl font-semibold mb-6 border-b border-bg-muted pb-3 text-heading">Security</h4>

                <form onSubmit={handlePasswordSubmit} className="max-w-md space-y-5 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-muted">Current Password</label>
                        <input
                            required
                            name="oldPassword"
                            value={passwordData.oldPassword}
                            onChange={handlePasswordChange}
                            type="password"
                            placeholder="••••••••"
                            className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-muted">New Password</label>
                        <input
                            required
                            name="newPassword"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            type="password"
                            placeholder="••••••••"
                            className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                        />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <MainBtn
                            type="submit"
                            text={changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                            disabled={changePasswordMutation.isPending}
                            className="bg-primary! text-white! rounded-sm! shadow-none! w-full sm:w-auto"
                        />
                        {/* <button
                            type="button"
                            onClick={() => {
                                setIsChangingPassword(false);
                                setPasswordData({ oldPassword: '', newPassword: '' });
                            }}
                            className="w-full sm:w-auto px-6 py-2.5 text-[14px] font-semibold text-text-muted hover:text-gray-900 bg-bg-surface border border-bg-muted hover:bg-gray-50 rounded-sm transition-colors cursor-pointer"
                        >
                            Cancel
                        </button> */}
                    </div>
                </form>
            </div>

            {/* Address Card */}
            <div className="bg-bg-surface p-8 border border-bg-muted shadow-sm rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b border-bg-muted pb-3">
                    <h4 className="text-xl font-semibold text-heading">Default Address</h4>
                </div>

                {defaultAddress ? (
                    <address className="text-paragraph not-italic space-y-2">
                        <p className="font-medium text-heading">{defaultAddress.firstName || user?.firstName} {defaultAddress.lastName || user?.lastName}</p>
                        <p>{defaultAddress.address}</p>
                        <p>{defaultAddress.city}, {defaultAddress.state} {defaultAddress.pincode}</p>
                        <p>{defaultAddress.phone && `Phone: ${defaultAddress.phone}`}</p>
                    </address>
                ) : (
                    <p className="text-paragraph not-italic">No default address saved yet.</p>
                )}

                <div className="mt-8">
                    <Link to="/account/addresses">
                        <MainBtn
                            type="button"
                            text={defaultAddress ? "View All" : "Add Address"}
                            className="bg-primary! text-white! rounded-sm! shadow-none!"
                        />
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Profile;