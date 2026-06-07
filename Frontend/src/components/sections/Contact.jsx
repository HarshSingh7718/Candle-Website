import React, { useState, useRef, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Pencil,
  ChevronDown,
  Heart,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import SEO from "../SEO";
import PageBanner from "../ui/PageBanner";
import MainBtn from "../ui/Buttons/MainBtn";
import { useSubmitContact } from "../../hooks/useContact";
import toast from "react-hot-toast";

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const containerRef = useRef(null);
  const heartRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    agree: false,
  });

  const [activeFaq, setActiveFaq] = useState(null);

  // ✅ Candle-specific FAQs for Naisha Creation
  const faqs = [
    {
      question: "Do you offer customization for bulk orders?",
      answer:
        "At Naisha Creations, we offer customization for bulk and corporate orders to make your gifts and events truly special. Whether you're planning a wedding, birthday celebration, baby shower, festive gifting, return favors, or corporate events, we can customize",
    },
    {
      question: "Can I customize the scents for bulk orders?",
      answer:
        "At Naisha Creations, we offer custom fragrance customization for bulk orders. You can choose from our range of popular scents or select specific fragrances that match your event, brand, or gifting theme.",
    },
    {
      question: "How long does it take to process bulk orders?",
      answer:
        "Bulk orders may take 10–20 business days depending on the quantity and design requirements. We recommend placing your order in advance to ensure timely delivery.",
    },
    {
      question: "How can I place a bulk or wholesale order?",
      answer:
        "To place a bulk or wholesale order, simply contact us with your requirements, quantity, customization details, and delivery timeline. Our team will assist you with product selection, pricing, and order confirmation to ensure a smooth experience.",
    },
    {
      question: "Do you ship across India?",
      answer:
        "Yes, we ship our products across India. Delivery timelines may vary based on your location.",
    },
    {
      question: "What if my order arrives damaged?",
      answer:
        "If your order arrives damaged, please contact us within 24 hours of delivery with photos and videos of the product and packaging, and we will assist you with a resolution.",
    },
  ];

  // ✅ Optimized GSAP Animations
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Entrance for Info & Form
      gsap.from(".info-column > *", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 30,
        stagger: 0.1,
        duration: 0.8,
        ease: "power3.out",
      });

      gsap.from(".form-column", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 80%",
        },
        opacity: 0,
        x: 30,
        duration: 1,
        ease: "power3.out",
      });

      // FAQ Section
      gsap.from(".faq-item", {
        scrollTrigger: {
          trigger: ".faq-section",
          start: "top 80%",
        },
        opacity: 0,
        y: 20,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
      });

      // Heart Pulse
      gsap.to(heartRef.current, {
        scale: 1.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const { mutate, isPending } = useSubmitContact();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.agree) {
      return toast.error("Please agree to the Privacy Policy.");
    }

    // ✅ Trigger the backend call
    mutate(formData, {
      onSuccess: (data) => {
        toast.success(data.message);
        setFormData({
          name: "",
          email: "",
          phone: "",
          message: "",
          agree: false,
        });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Something went wrong");
      },
    });
  };

  return (
    <div
      ref={containerRef}
      // 👉 BACKGROUND & TEXT: Updated to main blush theme and heading color
      className="min-h-screen bg-light-yellow font-sans text-heading overflow-x-hidden"
    >
      <SEO
        title="Contact Us | Naisha Creations"
        description="Get in touch with Naisha Creations for inquiries, bulk orders, or to find the perfect candle gift."
      />
      <PageBanner title="contact us" currentPage="Contact Us" />

      {/* Contact Section */}
      <div className="contact-section max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="info-column space-y-8">
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-heading mb-6 uppercase">
              Contact Us
            </h4>
            {/* 👉 ACCENT: Replaced gold/brown with coffee-500 */}
            <h1 className="text-4xl md:text-6xl font-semibold text-coffee-500 leading-tight mb-2">
              Have Questions?
            </h1>
            <h2 className="text-4xl md:text-6xl font-bold text-heading mb-8">
              Get In Touch!
            </h2>
            <p className="text-paragraph text-lg leading-relaxed max-w-lg">
              Whether you're looking for the perfect gift or need help choosing
              a scent for your sanctuary, our team is here to assist you.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div
              onMouseEnter={(e) => handleIconHover(e, true)}
              onMouseLeave={(e) => handleIconHover(e, false)}
              className="flex items-center space-x-5 group cursor-pointer"
            >
              {/* 👉 ICON CIRCLE: White background looks great on the blush theme */}
              <div className="icon-circle w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center flex-shrink-0 text-coffee-500 shadow-sm transition-colors">
                <MapPin size={20} />
              </div>
              <span className="text-paragraph text-lg">
                Dehradun, Uttarakhand, India
              </span>
            </div>

            <a
              href="tel:+919457583956"
              onMouseEnter={(e) => handleIconHover(e, true)}
              onMouseLeave={(e) => handleIconHover(e, false)}
              className="flex items-center space-x-5 group cursor-pointer"
            >
              <div className="icon-circle w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center flex-shrink-0 text-coffee-500 shadow-sm transition-colors">
                <Phone size={20} />
              </div>
              <span className="text-paragraph text-lg">+91 94575 83956</span>
            </a>

            <a
              href="mailto:support@naishacreations.com"
              onMouseEnter={(e) => handleIconHover(e, true)}
              onMouseLeave={(e) => handleIconHover(e, false)}
              className="flex items-center space-x-5 group cursor-pointer"
            >
              <div className="icon-circle w-12 h-12 rounded-full bg-bg-surface flex items-center justify-center flex-shrink-0 text-coffee-500 shadow-sm transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-paragraph text-lg">
                support@naishacreations.com
              </span>
            </a>
          </div>
        </div>

        {/* Right Column: Form */}
        {/* 👉 FORM CARD: Pure white background to pop off the light-yellow main bg */}
        <div className="form-column bg-bg-surface p-8 md:p-12 rounded-sm border border-muted/20 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {[
                {
                  name: "name",
                  icon: User,
                  placeholder: "Full Name",
                  type: "text",
                },
                {
                  name: "email",
                  icon: Mail,
                  placeholder: "Email Address",
                  type: "email",
                },
                {
                  name: "phone",
                  icon: Phone,
                  placeholder: "Phone Number",
                  type: "tel",
                },
              ].map((field) => (
                <div key={field.name} className="relative group">
                  <div className="absolute left-0 bottom-3 text-muted group-focus-within:text-coffee-500 transition-colors duration-300">
                    <field.icon size={18} />
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    required
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-8 pb-3 bg-transparent border-b border-muted focus:border-coffee-500 outline-none transition-all duration-300 placeholder-muted text-heading text-lg font-light"
                  />
                </div>
              ))}

              <div className="relative group pt-4">
                <div className="absolute left-0 top-1 text-muted group-focus-within:text-coffee-500 transition-colors duration-300">
                  <Pencil size={18} />
                </div>
                <textarea
                  name="message"
                  required
                  placeholder="Tell us about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-8 pb-3 bg-transparent border-b border-muted focus:border-coffee-500 outline-none transition-all duration-300 placeholder-muted text-heading text-lg font-light resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col space-y-6 pt-4">
              <div className="flex items-center space-x-3 text-paragraph">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="w-4 h-4 accent-coffee-500 cursor-pointer"
                />
                <label
                  htmlFor="agree"
                  className="text-sm cursor-pointer select-none font-light"
                >
                  I agree to the{" "}
                  <span className="underline hover:text-coffee-500">
                    Privacy Policy
                  </span>
                  .
                </label>
              </div>

              {/* 👉 BUTTON: Primary (dark) to match footer/navbar, hovers to coffee */}
              <MainBtn
                type="submit"
                text="SEND MESSAGE"
                className="w-full !bg-primary !text-white hover:!bg-coffee-500 transition-colors duration-500 py-4"
              />
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <h4 className="text-xs font-bold tracking-[0.2em] text-coffee-500 mb-4 uppercase">
            Common Queries
          </h4>
          <h2 className="text-3xl md:text-5xl font-bold text-heading">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              // 👉 FAQ CARDS: Kept white for contrast against blush background
              className="faq-item border-b border-muted/30 overflow-hidden bg-bg-surface rounded-xl shadow-sm px-6"
            >
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full py-6 text-left flex justify-between items-center group cursor-pointer"
              >
                <span
                  className={`text-lg md:text-xl font-medium transition-colors duration-300 ${activeFaq === index ? "text-coffee-500" : "text-heading"
                    }`}
                >
                  {faq.question}
                </span>
                <div
                  className={`text-muted transition-transform duration-500 ${activeFaq === index ? "rotate-180 text-coffee-500" : ""
                    }`}
                >
                  <ChevronDown size={20} />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === index
                    ? "max-h-[300px] opacity-100 pb-8"
                    : "max-h-0 opacity-0"
                  }`}
              >
                <p className="text-paragraph text-lg leading-relaxed font-light">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gifting Section */}
      {/* 👉 GIFTING SEC: Set to pure white to alternate with the light-yellow main bg */}
      <div className="gifting-section bg-bg-surface py-24 md:py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="gifting-content max-w-5xl">
            <h2 className="text-3xl md:text-5xl font-serif italic text-heading mb-10 leading-tight">
              Gifting Made Easy 🎁✨
            </h2>
            <p className="text-paragraph text-md md:text-xl leading-relaxed max-w-4xl">
              Looking for the perfect gift? Naisha Creations makes gifting effortless with beautifully handcrafted candles that are thoughtful, elegant, and memorable. Whether it's a birthday, wedding, anniversary, festive celebration, or corporate event, our candles are designed to make every occasion extra special. 💝🕯️
            </p>
            <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-8">
              <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                ✨ Personalized
              </span>
              <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                🕯️ Handmade
              </span>
              <span className="inline-flex items-center px-5 py-2.5 bg-coffee/10 text-coffee border border-coffee/20 text-sm font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
                💝 Perfect for Every Occasion
              </span>
            </div>
          </div>
          <div className="flex justify-center mt-20">
            <div ref={heartRef}>
              {/* 👉 HEART ICON: Uses coffee accent */}
              <Heart className="text-coffee-500 fill-current" size={36} />
            </div>
          </div>
        </div>

        {/* Subtle background decorative circle */}
        {/* 👉 DECORATION: Swapped to coffee with light opacity */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-coffee-500 opacity-[0.05] rounded-full -mr-48 -mt-48 pointer-events-none" />
      </div>
    </div>
  );
}
