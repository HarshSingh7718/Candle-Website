import { useState, useCallback } from 'react';

export const usePincodeLookup = () => {
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [pincodeError, setPincodeError] = useState(null);
    const [isManualEntryEnabled, setIsManualEntryEnabled] = useState(false);

    const lookupPincode = useCallback(async (pincode) => {
        if (!pincode || pincode.length !== 6) return null;

        setIsLookingUp(true);
        setPincodeError(null);
        setIsManualEntryEnabled(false);

        // 5-second timeout controller
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await response.json();

            if (data[0].Status === "Success") {
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District,
                    state: postOffice.State
                };
            } else {
                setPincodeError("Invalid Pincode");
                setIsManualEntryEnabled(true);
                return null;
            }
        } catch (err) {
            clearTimeout(timeoutId);
            setPincodeError(err.name === 'AbortError' 
                ? "Pincode server took too long to respond." 
                : "Could not verify pincode.");
            setIsManualEntryEnabled(true);
            return null;
        } finally {
            setIsLookingUp(false);
        }
    }, []);

    return { lookupPincode, isLookingUp, pincodeError, isManualEntryEnabled };
};