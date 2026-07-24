import React from 'react';
import SEO from '../components/SEO';
import BackButton from '../components/ui/BackButton';

export default function ReturnRefundPolicyPage() {
    return (
        <>
            <SEO
                title="Return & Refund Policy | Naisha Creations"
                description="Information on returns, refunds, and order cancellations at Naisha Creations."
            />
            <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl bg-bg-surface p-8 sm:p-12 border-stone-100">
                    <BackButton className="mb-6" />

                    {/* Header */}
                    <div className="mb-10 border-b border-stone-200 pb-8 text-center">
                        <h1 className="mb-2 text-3xl font-light text-stone-900 sm:text-4xl">Return & Refund Policy</h1>
                        <p className="text-sm font-medium text-[#D19D94] uppercase tracking-wider">
                            Effective Date: May 20, 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-stone-600">

                        <p className="leading-relaxed">
                            Thank you for shopping at Naisha Creations. We take pride in the handmade nature of our products. Please review our policy on returns, refunds, and cancellations below.
                        </p>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">1. Order Cancellations by Us</h2>
                            <p className="leading-relaxed">
                                Naisha Creations reserves the right to cancel any order at any time due to personal reasons, operational constraints, or unforeseen circumstances. If we cancel your order, any payment made will be fully refunded.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">2. Returns</h2>
                            <p className="leading-relaxed">
                                At Naisha Creations, each candle is carefully handcrafted and quality-checked before dispatch. Due to the handmade and fragile nature of our products, <strong>we do not accept returns unless the item arrives incorrect</strong>. For any return related queries, please reach out to our customer support team.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">3. Refunds</h2>
                            <p className="leading-relaxed">
                                Refunds are only applicable if you receive the wrong product. Due to the handmade and delicate nature of our products, we do not offer refunds or replacements for damages caused during shipping or transit. 
                            </p>
                            <p className="leading-relaxed mt-2">
                                <strong>If you receive an incorrect item, please contact us within 24 hours of delivery with clear photos and a video of opening the parcel and the product and packaging</strong>, and our team will assist you with the resolution.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">Contact Information</h2>
                            <p className="mb-4 text-sm leading-relaxed text-stone-700">
                                If you have any questions about our Return & Refund Policy, please contact us at:
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
