export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 sm:p-12">

                {/* Header */}
                <div className="mb-10 border-b border-stone-200 pb-8 text-center">
                    <h1 className="mb-2 text-3xl font-light text-stone-900 sm:text-4xl">Privacy Policy</h1>
                    <p className="text-sm font-medium text-[#D19D94] uppercase tracking-wider">
                        Effective Date: May 20, 2026
                    </p>
                </div>

                {/* Content */}
                <div className="space-y-8 text-stone-600">

                    <p className="leading-relaxed">
                        Welcome to Naisha Creations. This Privacy Policy explains how Naisha Creations ("we," "us," or "our") collects, uses, shares, and protects your personal data when you visit and make purchases on our website, <a href="https://naishacreations.com/" className="text-[#D19D94] hover:underline">https://naishacreations.com/</a> (the "Site").
                    </p>
                    <p className="leading-relaxed">
                        We are committed to protecting your privacy and complying with the Digital Personal Data Protection (DPDP) Act of India. By using our Site and providing your personal data, you consent to the practices described in this policy.
                    </p>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">1. What Personal Data We Collect</h2>
                        <p className="mb-4 leading-relaxed">
                            We collect personal information that you voluntarily provide to us when you create an account, place an order, or contact us.
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                            <li><strong>Identity & Contact Information:</strong> Name, email address, phone number, and physical shipping/billing addresses.</li>
                            <li><strong>Account Information:</strong> If you create an account, we store your login credentials (passwords are encrypted) and order history.</li>
                            <li><strong>Payment Information:</strong> We do not collect or store your full credit card, debit card, or UPI details. All payment processing is securely handled directly by our third-party payment gateway, Razorpay.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">2. How We Use Your Data</h2>
                        <p className="mb-4 leading-relaxed">
                            Under the DPDP Act, we only process your data for specified, lawful purposes to which you have consented. We use your data to:
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                            <li>Process and fulfill your orders, including sending order confirmations and shipping updates.</li>
                            <li>Manage and maintain your user account.</li>
                            <li>Provide customer support and respond to your inquiries.</li>
                            <li>Comply with legal and accounting obligations.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">3. Cookies and Storage</h2>
                        <p className="mb-4 leading-relaxed">
                            Our website uses "cookies"—small text files stored on your device—to ensure the Site functions properly.
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                            <li><strong>Essential Cookies:</strong> We use these to keep you logged into your account and to remember the items in your shopping cart as you browse.</li>
                            <li><strong>No Tracking:</strong> We do not use third-party tracking tools, marketing pixels, or analytics services to track your browsing behavior across other websites.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">4. How We Share Your Data</h2>
                        <p className="mb-4 leading-relaxed">
                            We do not sell, rent, or trade your personal data to any third parties. We only share your necessary information with trusted service providers who help us operate our business:
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                            <li><strong>Payment Processors:</strong> Your payment details are securely passed to Razorpay to process your transactions.</li>
                            <li><strong>Shipping & Logistics:</strong> We share your name, phone number, and delivery address with Shiprocket and its delivery partners to ensure your order reaches you.</li>
                        </ul>
                        <p className="mt-4 leading-relaxed text-sm italic">
                            These third parties act as Data Processors and are contractually obligated to protect your data and use it strictly for providing their designated services.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">5. Data Security and Retention</h2>
                        <p className="mb-4 leading-relaxed">
                            We implement reasonable security safeguards, including encryption and secure server hosting, to protect your personal data against unauthorized access, loss, or alteration.
                        </p>
                        <p className="leading-relaxed">
                            We retain your personal data only for as long as necessary to fulfill the purposes outlined in this policy (such as delivering your orders and maintaining your active account) or as required by Indian tax and corporate laws.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">6. Your Rights (Under the DPDP Act)</h2>
                        <p className="mb-4 leading-relaxed">
                            As a Data Principal under Indian law, you have specific rights regarding your personal data:
                        </p>
                        <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                            <li><strong>Right to Access:</strong> You can request a summary of the personal data we hold about you and the identities of any third parties we have shared it with.</li>
                            <li><strong>Right to Correction & Erasure:</strong> You can ask us to update inaccurate data or delete your personal data entirely from our systems.</li>
                            <li><strong>Right to Withdraw Consent:</strong> You may withdraw your consent for us to process your data at any time. (Note: Withdrawing consent may prevent us from providing certain services, such as delivering an active order or maintaining your account).</li>
                            <li><strong>Right to Nominate:</strong> You may nominate another individual to exercise your rights in the event of your death or incapacity.</li>
                        </ul>
                        <p className="mt-4 leading-relaxed text-sm">
                            To exercise any of these rights, please contact our Grievance Officer using the details below.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">7. Children's Privacy</h2>
                        <p className="leading-relaxed">
                            Our website is generally accessible to all ages; however, we do not knowingly collect personal data from children under the age of 18 without verifiable consent from a parent or lawful guardian. If you are a parent or guardian and believe we have collected data from your child unlawfully, please contact us to have it removed.
                        </p>
                    </section>

                    <section>
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">8. Updates to This Policy</h2>
                        <p className="leading-relaxed">
                            We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements. We will notify you of any significant changes by posting the updated policy on our website with a new "Effective Date."
                        </p>
                    </section>

                    <section >
                        <h2 className="mb-4 text-xl font-semibold text-stone-900">9. Grievance Officer & Contact</h2>
                        <p className="mb-4 text-sm leading-relaxed text-stone-700">
                            If you have any questions, concerns, or wish to exercise your data rights, please reach out to us:
                        </p>
                        <address className="rounded-xl bg-stone-100 p-6 mt-8 not-italic text-stone-800 space-y-1">
                            <strong>Naisha Creations</strong><br />
                            Email: <a href="mailto:support@naishacreations.com" className="text-[#D19D94] hover:underline">support@naishacreations.com</a><br />
                            Website: <a href="https://naishacreations.com/" className="text-[#D19D94] hover:underline">https://naishacreations.com/</a>
                        </address>
                    </section>

                </div>
            </div>
        </div>
    );
}