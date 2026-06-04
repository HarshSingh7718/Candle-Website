import React, { useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import MainBtn from "../../ui/Buttons/MainBtn";
import { useAddress } from "../../../hooks/useAddress";
import { usePincodeLookup } from "../../../hooks/usePincodeLookup"; // 👉 Import Pincode Hook

const Addresses = () => {
  const { user } = useOutletContext();
  const addresses = user?.addresses || [];

  const { addAddress, updateAddress, deleteAddress, isAdding, isUpdating } =
    useAddress();
  const { lookupPincode, isLookingUp, pincodeError, isManualEntryEnabled } = usePincodeLookup(); // 👉 Initialize Hook

  // State to toggle between the list view and the form view
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State - Split address into flat, area, landmark
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    flat: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  // 👉 LOGIC: Is this their very first address, OR are they editing their only address?
  const isOnlyAddress =
    addresses.length === 0 ||
    (addresses.length === 1 && editingId === addresses[0]._id);

  const handleOpenForm = (addressObj = null) => {
    if (addressObj) {
      // Attempt to elegantly split existing saved addresses for the edit view
      const parts = addressObj.address
        ? addressObj.address.split(",").map((s) => s.trim())
        : [];
      const flat = parts[0] || "";
      const area = parts[1] || "";
      const landmark = parts.slice(2).join(", ") || "";

      setFormData({
        ...addressObj,
        flat,
        area,
        landmark,
      });
      setEditingId(addressObj._id);
    } else {
      setFormData({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phoneNumber || "",
        flat: "",
        area: "",
        landmark: "",
        city: "",
        state: "",
        pincode: "",
        isDefault: addresses.length === 0, // Automatically true if no addresses
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;

    // 👉 PINCODE INTERCEPTOR
    if (name === "pincode") {
      const val = value.replace(/\D/g, "").slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: val }));

      if (val.length === 6) {
        const locationData = await lookupPincode(val);
        if (locationData) {
          setFormData((prev) => ({
            ...prev,
            city: locationData.city,
            state: locationData.state,
          }));
        } else {
          setFormData((prev) => ({ ...prev, city: "", state: "" }));
        }
      }
    } else {
      // Standard handler for everything else
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 👉 JOIN THE FIELDS: Combine Flat, Area, and Landmark securely
    const joinedAddress = [
      formData.flat?.trim(),
      formData.area?.trim(),
      formData.landmark?.trim(),
    ]
      .filter(Boolean)
      .join(", "); // filter(Boolean) safely ignores empty landmarks!

    const finalData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      address: joinedAddress, // Send perfectly joined string to DB
      isDefault: isOnlyAddress ? true : formData.isDefault,
    };

    try {
      if (editingId) {
        await updateAddress({ addressId: editingId, addressData: finalData });
      } else {
        await addAddress(finalData);
      }
      handleCloseForm();
    } catch (error) {
      // Errors handled natively by useAddress toast
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
      <div className="bg-bg-surface p-8 border border-bg-muted shadow-sm rounded-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-6 border-b border-bg-muted pb-3">
          <h4 className="text-xl font-semibold text-heading">
            {editingId ? "Edit Address" : "Add New Address"}
          </h4>
          <button
            onClick={handleCloseForm}
            className="text-sm text-paragraph hover:text-coffee underline cursor-pointer"
          >
            Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                First Name
              </label>
              <input
                required
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                type="text"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                Last Name
              </label>
              <input
                required
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                type="text"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>

            {/* 👉 REPLACED SINGLE ADDRESS WITH THREE SPECIFIC FIELDS */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[13px] font-medium text-text-muted">
                Flat / House No.
              </label>
              <input
                required
                name="flat"
                value={formData.flat}
                onChange={handleChange}
                type="text"
                placeholder="Flat, House no., Building, Company, Apartment"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[13px] font-medium text-text-muted">
                Area / Street
              </label>
              <input
                required
                name="area"
                value={formData.area}
                onChange={handleChange}
                type="text"
                placeholder="Area, Street, Sector, Village"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-[13px] font-medium text-text-muted">
                Landmark (Optional)
              </label>
              <input
                name="landmark"
                value={formData.landmark}
                onChange={handleChange}
                type="text"
                placeholder="E.g. Near Apollo Hospital"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>

            {/* 👉 PINCODE FIELD WITH SPINNER */}
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                Pincode / ZIP
              </label>
              <div className="relative">
                <input
                  required
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  type="text"
                  maxLength={6}
                  minLength={6}
                  className={`w-full py-2.5 px-4 bg-bg-surface border rounded-sm focus:outline-none text-[14px] ${pincodeError ? "border-danger/50 focus:border-red-400" : "border-bg-muted focus:border-gray-400"}`}
                />
                {isLookingUp && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-text-disabled" />
                  </div>
                )}
              </div>
              {pincodeError && !isManualEntryEnabled && (
                <p className="text-danger text-[11px] mt-1">{pincodeError}</p>
              )}
              {isManualEntryEnabled && (
                <div className="flex items-start gap-2 text-warning bg-warning/10 p-2 rounded-sm border border-warning/50 mt-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                  <p className="text-[12px]">
                    {pincodeError || "Pincode lookup failed. Please enter your City and State manually."}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                City
              </label>
              <input
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                type="text"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                State
              </label>
              <input
                required
                name="state"
                value={formData.state}
                onChange={handleChange}
                type="text"
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[13px] font-medium text-text-muted">
                Mobile Number
              </label>
              <input
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                type="tel"
                maxLength={10}
                minLength={10}
                className="w-full py-2.5 px-4 bg-bg-surface border border-bg-muted rounded-sm focus:outline-none focus:border-gray-400 text-[14px]"
              />
            </div>
          </div>

          {/* 👉 DYNAMIC DEFAULT CHECKBOX */}
          <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="isDefault"
              name="isDefault"
              checked={isOnlyAddress ? true : formData.isDefault}
              onChange={handleChange}
              disabled={isOnlyAddress}
              className="w-4 h-4 text-text-base border-bg-muted rounded focus:ring-text-base accent-text-base disabled:opacity-50"
            />
            <label
              htmlFor="isDefault"
              className={`text-[14px] text-text-muted ${isOnlyAddress ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
            >
              Set as default shipping address{" "}
              {isOnlyAddress && "(Required for first address)"}
            </label>
          </div>

          <div className="pt-4 border-t border-bg-muted">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-coffee hover:bg-gray-900 text-text-on-brand font-bold rounded-sm text-[14px] transition-all disabled:bg-gray-400 cursor-pointer"
            >
              {isSubmitting
                ? "Saving..."
                : editingId
                  ? "Update Address"
                  : "Save Address"}
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
    <div className="bg-bg-surface p-8 border border-bg-muted shadow-sm rounded-sm animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6 border-b border-bg-muted pb-3">
        <h4 className="text-xl font-semibold text-heading">Saved Addresses</h4>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center gap-1 text-sm font-semibold text-coffee-600 hover:text-coffee-700 transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <MapPin size={48} className="text-gray-300 mb-4" />
          <p className="text-paragraph mb-4">
            You haven't saved any addresses yet.
          </p>
          <MainBtn
            onClick={() => handleOpenForm()}
            type="button"
            text="Add New Address"
            className="bg-coffee! text-white! rounded-sm! shadow-none!"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr._id}
              className={`relative p-6 border rounded-sm transition-all ${addr.isDefault ? "border-text-base bg-bg-surface-hover" : "border-bg-muted hover:border-gray-300"}`}
            >
              {addr.isDefault && (
                <span className="absolute -top-3 left-4 bg-primary text-text-on-brand text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-sm flex items-center gap-1">
                  <CheckCircle2 size={12} /> Default
                </span>
              )}

              <address className="not-italic text-[14px] text-text-muted space-y-1 mb-4 mt-2">
                <p className="font-semibold text-text-base text-[15px] mb-2">
                  {addr.firstName} {addr.lastName}
                </p>
                <p>{addr.address}</p>
                <p>
                  {addr.city}, {addr.state} {addr.pincode}
                </p>
                <p className="pt-2">Mobile: +91 {addr.phone}</p>
              </address>

              <div className="flex items-center gap-4 pt-4 border-t border-bg-muted">
                <button
                  onClick={() => handleOpenForm(addr)}
                  className="flex items-center gap-1 text-[13px] font-medium text-text-muted hover:text-black transition-colors cursor-pointer"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(addr._id)}
                  className="flex items-center gap-1 text-[13px] font-medium text-danger hover:text-red-700 transition-colors cursor-pointer"
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
