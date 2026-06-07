import React from 'react';
import SEO from '../components/SEO';

export default function TermsOfServicePage() {
    return (
        <>
            <SEO
                title="Terms Of Service | Naisha Creations"
                description="Shop our full range of luxury scented candles. Hand-poured with eco-friendly soy wax and premium fragrance oils."
            />
            <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-3xl rounded-2xl bg-bg-surface p-8 sm:p-12 border-stone-100">

                    {/* Header */}
                    <div className="mb-10 border-b border-stone-200 pb-8 text-center">
                        <h1 className="mb-2 text-3xl font-light text-stone-900 sm:text-4xl">Terms and Conditions</h1>
                        <p className="text-sm font-medium text-[#D19D94] uppercase tracking-wider">
                            Effective Date: May 20, 2026
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 text-stone-600">

                        <p className="leading-relaxed">
                            Welcome to Naisha Creations. These Terms and Conditions ("Terms") govern your use of our website, <a href="https://naishacreations.com/" className="text-[#D19D94] hover:underline">https://naishacreations.com/</a> (the "Site"), and your purchase of products from us.
                        </p>
                        <p className="leading-relaxed">
                            By accessing our Site, registering for an account, or making a purchase, you agree to be bound by these Terms. If you do not agree with any part of these Terms, please do not use our Site.
                        </p>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">1. General Conditions and Eligibility</h2>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li><strong>Eligibility:</strong> While our Site is accessible to users of all ages, under the Indian Contract Act, 1872, you must be at least 18 years of age to enter into a legally binding contract. If you are under 18, you may use our Site only with the involvement and consent of a parent or legal guardian.</li>
                                <li><strong>Site Modifications:</strong> We reserve the right to modify, suspend, or discontinue any part of the Site or our services at any time without prior notice.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">2. User Accounts</h2>
                            <p className="mb-4 leading-relaxed">
                                To access certain features, such as order tracking and faster checkout, you may register for a user account.
                            </p>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li><strong>Accuracy of Information:</strong> You agree to provide current, complete, and accurate information during the registration and checkout process.</li>
                                <li><strong>Account Security:</strong> You are responsible for maintaining the confidentiality of your account login credentials. Naisha Creations is not liable for any loss or damage arising from your failure to protect your password.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">3. Products, Pricing, and Availability</h2>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li><strong>Product Descriptions:</strong> We make every effort to display our customised candles and other products (including colors, sizes, and features) as accurately as possible. However, we do not guarantee that your device's display will perfectly reflect the actual product.</li>
                                <li><strong>Pricing:</strong> All prices are listed in Indian Rupees (INR) and are subject to change without notice. We reserve the right to correct any pricing errors that may inadvertently occur on the Site.</li>
                                <li><strong>Availability:</strong> All orders are subject to product availability. We reserve the right to limit the quantities of any products or services that we offer, or to cancel orders if an item is out of stock.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">4. Payments and Billing</h2>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li><strong>Payment Gateway:</strong> We use Razorpay, a secure and authorized third-party payment gateway, to process all transactions.</li>
                                <li><strong>Billing details:</strong> By placing an order, you agree to provide valid payment details. Naisha Creations does not collect or store your complete credit card, debit card, or UPI information on our servers.</li>
                                <li><strong>Fraud Prevention:</strong> We reserve the right to refuse or cancel any order if we suspect fraudulent activity.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">5. Shipping and Delivery</h2>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li>
                                    <strong>Processing Time:</strong> Orders are handcrafted and dispatched within <strong>2–5 business days</strong>. Customised or bulk orders may require additional production time based on quantity and design complexity.
                                </li>
                                <li>
                                    <strong>Delivery:</strong> Naisha Creations partners with <strong>Shiprocket</strong> and its associated courier networks for order fulfilment. Delivery timelines vary by location. Tracking details will be shared once your order is dispatched.
                                </li>
                                <li>
                                    <strong>Customer Responsibility:</strong> Customers must ensure all shipping information provided at the time of order is accurate and complete. Naisha Creations bears no liability for delays or failed deliveries arising from incorrect or incomplete addresses provided by the customer.
                                </li>
                                <li>
                                    <strong>Damage &amp; Loss in Transit:</strong> Naisha Creations ensures all orders are securely packaged before dispatch. Once handed over to the courier, we are not responsible for any damage, loss, or delay occurring during transit. All such claims must be raised directly with <strong>Shiprocket</strong> or the assigned courier partner using the tracking details provided.
                                </li>
                                <li>
                                    <strong>Delays:</strong> Naisha Creations is not liable for delivery delays caused by courier services, weather conditions, public holidays, strikes, or other circumstances beyond our reasonable control.
                                </li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">6. Returns, Refunds, and Cancellations</h2>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li><strong>Order Cancellations by Us:</strong> Naisha Creations reserves the right to cancel any order at any time due to personal reasons, operational constraints, or unforeseen circumstances. If we cancel your order, any payment made will be fully refunded.</li>
                                <li><strong>Returns:</strong> At Naisha Creations, each candle is carefully handcrafted and quality-checked before dispatch. Due to the handmade and fragile nature of our products, <strong>we do not accept returns unless the item arrives incorrect</strong>. For any return related queries, please reach out to our customer support team.</li>
                                <li><strong>Refunds:</strong> Refunds are only applicable if you receive the wrong product. Due to the handmade and delicate nature of our products, we do not offer refunds or replacements for damages caused during shipping or transit. <strong>If you receive an incorrect item, please contact us within 24 hours of delivery with clear photos and a video of opening the parcel and the product and packaging</strong>, and our team will assist you with the resolution.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">7. Intellectual Property</h2>
                            <p className="leading-relaxed">
                                All content on this Site, including but not limited to text, graphics, logos, images, custom product designs, and software, is the property of Naisha Creations and is protected by Indian copyright and intellectual property laws. You may not reproduce, distribute, or use our content for commercial purposes without our express written permission.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">8. Prohibited Conduct</h2>
                            <p className="mb-4 leading-relaxed">
                                You agree not to use the Site for any unlawful purpose. You are prohibited from:
                            </p>
                            <ul className="ml-6 list-disc space-y-2 text-sm leading-relaxed">
                                <li>Attempting to interfere with the Site's security or network.</li>
                                <li>Using any automated tools, spiders, or bots to scrape data from our Site.</li>
                                <li>Submitting false or misleading information.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">9. Limitation of Liability</h2>
                            <p className="leading-relaxed">
                                To the maximum extent permitted by law, Naisha Creations, its owners, and affiliates shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site, your inability to use the Site, or any products purchased through the Site.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">10. Governing Law and Jurisdiction</h2>
                            <p className="leading-relaxed">
                                These Terms and Conditions are governed by and construed in accordance with the laws of India. Any disputes arising out of or related to these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts located in India.
                            </p>
                        </section>

                        <section>
                            <h2 className="mb-4 text-xl font-semibold text-stone-900">11. Contact Information</h2>
                            <p className="mb-4 text-sm leading-relaxed text-stone-700">
                                If you have any questions about these Terms and Conditions, please contact us at:
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