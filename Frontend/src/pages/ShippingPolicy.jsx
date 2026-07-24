import React from 'react';
import SEO from '../components/SEO';
import BackButton from '../components/ui/BackButton';

export default function ShippingPolicyPage() {
    return (
        <>
            <SEO
                title="Shipping Policy | Naisha Creations"
                description="Information on shipping, delivery times, and order processing at Naisha Creations."
            />
            <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl bg-bg-surface p-8 sm:p-12 border-stone-100">
                    <BackButton className="mb-6" />

                    {/* Header */}
                    <div className="mb-10 border-b border-stone-200 pb-8 text-center">
                        <h1 className="mb-2 text-3xl font-light text-stone-900 sm:text-4xl">Shipping Policy</h1>
                        <p className="text-sm font-medium text-[#D19D94] uppercase tracking-wider">
                            Effective Date: May 20, 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-stone-600">

                        <p className="leading-relaxed">
                            Thank you for choosing Naisha Creations. This policy outlines our shipping procedures, delivery times, and customer responsibilities regarding the shipment of your handcrafted items.
                        </p>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">1. Processing Time</h2>
                            <p className="leading-relaxed">
                                Orders are handcrafted and dispatched within <strong>2–5 business days</strong>. Customised or bulk orders may require additional production time based on quantity and design complexity.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">2. Delivery</h2>
                            <p className="leading-relaxed">
                                Naisha Creations partners with <strong>Shiprocket</strong> and its associated courier networks for order fulfilment. Delivery timelines vary by location. Tracking details will be shared once your order is dispatched.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">3. Customer Responsibility</h2>
                            <p className="leading-relaxed">
                                Customers must ensure all shipping information provided at the time of order is accurate and complete. Naisha Creations bears no liability for delays or failed deliveries arising from incorrect or incomplete addresses provided by the customer.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">4. Damage & Loss in Transit</h2>
                            <p className="leading-relaxed">
                                Naisha Creations ensures all orders are securely packaged before dispatch. Once handed over to the courier, we are not responsible for any damage, loss, or delay occurring during transit. All such claims must be raised directly with <strong>Shiprocket</strong> or the assigned courier partner using the tracking details provided.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">5. Delays</h2>
                            <p className="leading-relaxed">
                                Naisha Creations is not liable for delivery delays caused by courier services, weather conditions, public holidays, strikes, or other circumstances beyond our reasonable control.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">Contact Information</h2>
                            <p className="mb-4 text-sm leading-relaxed text-stone-700">
                                If you have any questions about our Shipping Policy, please contact us at:
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
        </>
    );
}
