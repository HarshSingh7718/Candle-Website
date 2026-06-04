import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import toast from 'react-hot-toast';
import { useUpdateProfile, useUser, useRequestPhoneOtp, useVerifyPhoneUpdate } from '../../../hooks/useAuth';

const EditProfile = ({ onCancel }) => {
    const { data: user } = useUser();
    const updateProfileMutation = useUpdateProfile();
    const requestOtpMutation = useRequestPhoneOtp();
    const verifyPhoneMutation = useVerifyPhoneUpdate();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    /**
     * handleSubmit — Intercepts form submission.
     * If the phone number changed → triggers OTP flow before saving.
     * If only name/email changed → saves normally via the standard endpoint.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.firstName.trim()) {
            return toast.error("First name cannot be empty");
        }
        if (!formData.email.trim() || !formData.email.includes("@")) {
            return toast.error("Please enter a valid email address");
        }

        const phoneChanged = formData.phoneNumber !== (user?.phoneNumber || '');
        const nameOrEmailChanged = formData.firstName !== (user?.firstName || '') || 
                                   formData.lastName !== (user?.lastName || '') || 
                                   formData.email !== (user?.email || '');

        if (phoneChanged) {
            // Validate phone format before sending OTP
            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(formData.phoneNumber)) {
                return toast.error("Enter a valid 10-digit phone number");
            }

            // Trigger OTP flow — pause the save
            setPendingPhoneNumber(formData.phoneNumber);
            try {
                await requestOtpMutation.mutateAsync(formData.phoneNumber);
                setOtpDigits(['', '', '', '', '', '']);
                setShowOtpModal(true);
                // Focus first input after modal opens
                setTimeout(() => inputRefs.current[0]?.focus(), 100);
            } catch {
                // Error toast is handled by the hook
            }

            // Only save non-phone fields if they actually changed
            if (nameOrEmailChanged) {
                const { phoneNumber, ...nonPhoneData } = formData;
                updateProfileMutation.mutate(nonPhoneData);
            }
        } else {
            // No phone change — save everything normally if needed
            if (nameOrEmailChanged) {
                const { phoneNumber, ...nonPhoneData } = formData;
                updateProfileMutation.mutate(nonPhoneData, {
                    onSuccess: () => {
                        if (onCancel) onCancel();
                    }
                });
            } else {
                if (onCancel) onCancel();
            }
        }
    };

    // ==========================================
    // OTP INPUT HANDLERS
    // ==========================================
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newDigits = [...otpDigits];
        newDigits[index] = value.slice(-1); // Take last digit only
        setOtpDigits(newDigits);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        // Backspace: clear current and move to previous
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
        // Focus last filled input or the next empty one
        const focusIndex = Math.min(pasted.length, 5);
        inputRefs.current[focusIndex]?.focus();
    };

    const handleOtpSubmit = async () => {
        const otp = otpDigits.join('');
        if (otp.length !== 6) {
            return toast.error("Please enter the complete 6-digit OTP");
        }

        try {
            await verifyPhoneMutation.mutateAsync({
                newPhoneNumber: pendingPhoneNumber,
                otp
            });
            setShowOtpModal(false);
            setOtpDigits(['', '', '', '', '', '']);
            setPendingPhoneNumber('');
            if (onCancel) onCancel();
        } catch {
            // Error toast handled by the hook
        }
    };

    const handleResendOtp = async () => {
        try {
            await requestOtpMutation.mutateAsync(pendingPhoneNumber);
            setOtpDigits(['', '', '', '', '', '']);
            setTimeout(() => inputRefs.current[0]?.focus(), 100);
        } catch {
            // Error toast handled by the hook
        }
    };

    const isSubmitting = updateProfileMutation.isPending || requestOtpMutation.isPending;

    return (
        <>
            <div className="bg-bg-surface rounded-[24px] border border-bg-muted p-6 md:p-8 shadow-sm w-full max-w-2xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-2xl font-bold text-text-base tracking-tight">Edit Profile</h2>
                    <p className="text-[14px] text-text-muted mt-1">Update your personal information.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* First Name */}
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-text-muted">First Name</label>
                            <input
                                required
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                type="text"
                                placeholder="John"
                                className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                            />
                        </div>

                        {/* Last Name */}
                        <div className="space-y-1.5">
                            <label className="block text-[13px] font-medium text-text-muted">Last Name</label>
                            <input
                                required
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                type="text"
                                placeholder="Doe"
                                className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                            />
                        </div>
                    </div>

                    {/* Email Address */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-muted">Email Address</label>
                        <input
                            required
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            type="email"
                            placeholder="john@example.com"
                            className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                        />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                        <label className="block text-[13px] font-medium text-text-muted">Mobile Number</label>
                        <input
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            type="tel"
                            placeholder="9876543210"
                            maxLength={10}
                            className="w-full py-2.5 px-4 bg-bg-surface-hover border border-bg-muted rounded-[16px] focus:outline-none focus:border-coffee-600 focus:bg-white focus:ring-1 focus:ring-coffee-600 transition-all text-[14px]"
                        />
                        {formData.phoneNumber !== (user?.phoneNumber || '') && formData.phoneNumber.length > 0 && (
                            <p className="text-[11px] text-warning mt-1 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Changing your number will require OTP verification
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-bg-muted">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="w-full sm:w-auto px-6 py-2.5 text-[14px] font-semibold text-text-muted hover:text-gray-900 bg-bg-surface border border-bg-muted hover:bg-gray-50 rounded-[20px] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full sm:w-auto px-6 py-2.5 bg-coffee hover:bg-coffee/85 text-text-on-brand font-bold rounded-[20px] transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.39)] text-[14px] disabled:bg-gray-400 cursor-pointer"
                        >
                            {isSubmitting ? "Saving Changes..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ==========================================
                OTP VERIFICATION MODAL
            ========================================== */}
            {showOtpModal && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
                    <div className="bg-bg-surface rounded-[24px] p-8 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-coffee/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-coffee" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-text-base">Verify Your Number</h3>
                            <p className="text-sm text-text-muted mt-2">
                                We've sent a 6-digit code to <span className="font-semibold text-text-base">+91 {pendingPhoneNumber}</span>
                            </p>
                        </div>

                        {/* OTP Inputs */}
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
                                    className="w-12 h-14 text-center text-xl font-bold border-2 border-bg-muted rounded-xl focus:border-coffee focus:ring-2 focus:ring-coffee/20 focus:outline-none transition-all bg-bg-surface-hover focus:bg-white"
                                />
                            ))}
                        </div>

                        {/* Verify Button */}
                        <button
                            onClick={handleOtpSubmit}
                            disabled={verifyPhoneMutation.isPending || otpDigits.join('').length !== 6}
                            className="w-full py-3 bg-coffee hover:bg-coffee/85 text-text-on-brand font-bold rounded-[16px] transition-all text-[14px] disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer shadow-[0_4px_14px_0_rgba(234,88,12,0.39)]"
                        >
                            {verifyPhoneMutation.isPending ? "Verifying..." : "Verify & Update Number"}
                        </button>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between mt-6">
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={requestOtpMutation.isPending}
                                className="text-sm text-coffee hover:text-coffee-700 font-medium cursor-pointer disabled:text-gray-400"
                            >
                                {requestOtpMutation.isPending ? "Sending..." : "Resend OTP"}
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowOtpModal(false); setOtpDigits(['', '', '', '', '', '']); }}
                                className="text-sm text-text-muted hover:text-gray-700 font-medium cursor-pointer"
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

export default EditProfile;