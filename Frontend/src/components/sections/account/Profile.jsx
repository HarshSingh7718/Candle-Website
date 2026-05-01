import React, { useState } from 'react'; // 👉 Added useState
import { useOutletContext, Link } from 'react-router-dom';
import MainBtn from '../../ui/Buttons/MainBtn';
import EditProfile from './EditProfile'; // 👉 Import the component we just built

const Profile = () => {
    const { user } = useOutletContext();
    const [isEditing, setIsEditing] = useState(false);

    const defaultAddress = user?.addresses?.find(addr => addr.isDefault) || user?.addresses?.[0];

    // 👉 If editing is true, show the form instead of the profile details
    if (isEditing) {
        return <EditProfile onCancel={() => setIsEditing(false)} />;
    }

    // Otherwise, show the standard profile view
    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Account Details Card */}
            <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm">
                <h4 className="text-xl font-semibold mb-6 border-b border-gray-200 pb-3 text-heading">Account Details</h4>

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
                            {/* Optional: Show a badge if unverified */}
                            {user?.phoneNumber && !user?.isPhoneVerified && (
                                <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Unverified</span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mt-8">
                    <MainBtn
                        type="button"
                        text="Edit Profile"
                        onClick={() => setIsEditing(true)} // 👉 Attach the toggle!
                        className="bg-black! text-white! rounded-sm! shadow-none!"
                    />
                </div>
            </div>

            {/* Address Card */}
            <div className="bg-white p-8 border border-gray-200 shadow-sm rounded-sm">
                <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
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
                            className="bg-black! text-white! rounded-sm! shadow-none!"
                        />
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Profile;