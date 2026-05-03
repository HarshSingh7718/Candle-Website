import { useState, useCallback } from 'react';

export const usePincodeLookup = () => {
    const [isLookingUp, setIsLookingUp] = useState(false);
    const [pincodeError, setPincodeError] = useState(null);

    const lookupPincode = useCallback(async (pincode) => {
        // Indian pincodes are strictly 6 digits
        if (!pincode || pincode.length !== 6) return null;

        setIsLookingUp(true);
        setPincodeError(null);

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data[0].Status === "Success") {
                // The API returns an array of post offices for that pincode. 
                // They all share the same District and State, so we just grab the first one.
                const postOffice = data[0].PostOffice[0];
                return {
                    city: postOffice.District,
                    state: postOffice.State
                };
            } else {
                setPincodeError("Invalid Pincode");
                return null;
            }
        } catch (err) {
            setPincodeError("Could not verify pincode. Please enter details manually.");
            return null;
        } finally {
            setIsLookingUp(false);
        }
    }, []);

    return { lookupPincode, isLookingUp, pincodeError };
};