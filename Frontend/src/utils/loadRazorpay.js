export const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        // If it's already loaded (e.g., they clicked pay twice), don't load it again
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => {
            console.error("Razorpay SDK failed to load.");
            resolve(false);
        };
        document.body.appendChild(script);
    });
};