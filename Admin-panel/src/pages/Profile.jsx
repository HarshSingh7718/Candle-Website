import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useAdminProfile, useUpdateAdminProfile, useChangeAdminPassword, useRequestPhoneOtp, useVerifyPhoneUpdate } from '../hooks/useProfile';
import toast from 'react-hot-toast';

const Profile = () => {
    const { data: user, isLoading, isFetching } = useAdminProfile();
    const updateProfile = useUpdateAdminProfile();
    const changePassword = useChangeAdminPassword();
    const requestOtpMutation = useRequestPhoneOtp();
    const verifyPhoneMutation = useVerifyPhoneUpdate();

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

    // OTP modal state
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
    const [pendingPhoneNumber, setPendingPhoneNumber] = useState('');
    const inputRefs = useRef([]);

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

    /**
     * handleProfileSubmit — If phone changed, trigger OTP flow.
     * Otherwise, save name/email normally (phoneNumber stripped by backend).
     */
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        const phoneChanged = formData.phoneNumber !== (user?.phoneNumber || '');
        const nameOrEmailChanged = formData.firstName !== (user?.firstName || '') || 
                                   formData.lastName !== (user?.lastName || '') || 
                                   formData.email !== (user?.email || '');

        if (phoneChanged) {
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                return toast.error("Enter a valid 10-digit phone number");
            }

            setPendingPhoneNumber(formData.phoneNumber);
            try {
                await requestOtpMutation.mutateAsync(formData.phoneNumber);
                setOtpDigits(['', '', '', '', '', '']);
                setShowOtpModal(true);
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } catch {
                // Error toast handled by hook
            }

            if (nameOrEmailChanged) {
                const { phoneNumber, ...nonPhoneData } = formData;
                updateProfile.mutate(nonPhoneData);
            }
        } else {
            if (nameOrEmailChanged) {
                const { phoneNumber, ...nonPhoneData } = formData;
                updateProfile.mutate(nonPhoneData);
            }
        }
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

    // ==========================================
    // OTP INPUT HANDLERS
    // ==========================================
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1);
        setOtpDigits(newDigits);
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        const newDigits = [...otpDigits];
        for (let i = 0; i < pasted.length; i++) {
            newDigits[i] = pasted[i];
        }
        setOtpDigits(newDigits);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    const handleOtpSubmit = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            return toast.error("Please enter the complete 6-digit OTP");
        }
        try {
            await verifyPhoneMutation.mutateAsync({ newPhoneNumber: pendingPhoneNumber, otp });
            setShowOtpModal(false);
            setOtpDigits(['', '', '', '', '', '']);
            setPendingPhoneNumber('');
        } catch {
            // Error toast handled by hook
        }
    };

    const handleResendOtp = async () => {
        try {
            await requestOtpMutation.mutateAsync(pendingPhoneNumber);
            setOtpDigits(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch {
            // Error toast handled by hook
        }
    };

    if (isLoading) {
        return (
            <div className="w-full space-y-8 animate-pulse">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-bg-surface rounded-xl shadow-sm border border-bg-muted p-6 h-[400px]"></div>
                    <div className="bg-bg-surface rounded-xl shadow-sm border border-bg-muted p-6 h-[300px]"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className={`w-full space-y-8 transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Profile Info Form */}
                    <div className="bg-bg-surface rounded-xl shadow-sm border border-bg-muted p-6">
                        <h3 className="text-lg font-bold mb-6 text-text-base">Personal Information</h3>
                        <form onSubmit={handleProfileSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">First Name</label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleFormChange}
                                        className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Phone Number</label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleFormChange}
                                    maxLength={10}
                                    className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                />
                                {formData.phoneNumber !== (user?.phoneNumber || '') && formData.phoneNumber.length > 0 && (
                                    <p className="text-xs text-orange-600 mt-1">
                                        ⚠ Changing your number will require OTP verification
                                    </p>
                                )}
                            </div>
                            <button
                                type="submit"
                                disabled={updateProfile.isPending || requestOtpMutation.isPending}
                                className="mt-4 bg-[#8d4b00] text-white px-6 py-2 rounded-md hover:bg-[#b15f00] transition-colors disabled:opacity-50"
                            >
                                {updateProfile.isPending || requestOtpMutation.isPending ? "Saving..." : "Save Profile"}
                            </button>
                        </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-bg-surface rounded-xl shadow-sm border border-bg-muted p-6 h-fit">
                        <h3 className="text-lg font-bold mb-6 text-text-base">Change Password</h3>
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">Current Password</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full px-4 py-2 border border-bg-muted rounded-md bg-bg-surface text-text-base focus:outline-none focus:border-brand-primary"
                                    placeholder="••••••••"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={changePassword.isPending}
                                className="mt-4 bg-[#8d4b00] text-white px-6 py-2 rounded-md hover:bg-[#b15f00] transition-colors disabled:opacity-50"
                            >
                                {changePassword.isPending ? "Updating..." : "Update Password"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* ==========================================
                OTP VERIFICATION MODAL (Admin)
            ========================================== */}
            {showOtpModal && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-bg-surface rounded-xl p-8 w-full max-w-md shadow-2xl">
                        <div className="text-center mb-8">
                            <div className="w-14 h-14 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-brand-primary text-[28px]">smartphone</span>
                            </div>
                            <h3 className="text-xl font-bold text-text-base">Verify New Number</h3>
                            <p className="text-sm text-text-muted mt-2">
                                Enter the 6-digit code sent to <span className="font-semibold text-text-base">+91 {pendingPhoneNumber}</span>
                            </p>
                        </div>

                        <div className="flex justify-center gap-3 mb-8" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => (inputRefs.current[index] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    className="w-12 h-14 text-center text-xl font-bold border-2 border-bg-muted rounded-lg focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 focus:outline-none transition-all bg-bg-surface"
                                />
                            ))}
                        </div>

                        <button
                            onClick={handleOtpSubmit}
                            disabled={verifyPhoneMutation.isPending || otpDigits.join('').length !== 6}
                            className="w-full py-3 bg-[#8d4b00] hover:bg-[#b15f00] text-white font-bold rounded-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {verifyPhoneMutation.isPending ? "Verifying..." : "Verify & Update Number"}
                        </button>

                        <div className="flex items-center justify-between mt-6">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={requestOtpMutation.isPending}
                                className="text-sm text-brand-primary hover:text-brand-primary-container font-medium cursor-pointer disabled:text-text-disabled"
                            >
                                {requestOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowOtpModal(false); setOtpDigits(['', '', '', '', '', '']); }}
                                className="text-sm text-text-muted hover:text-text-base font-medium cursor-pointer"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default Profile;
