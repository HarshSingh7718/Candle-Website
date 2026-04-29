import React, { useState, useRef, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Pencil, 
  ChevronDown,
  Heart
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import PageBanner from '../ui/PageBanner';
import MainBtn from '../ui/Buttons/MainBtn';
import { useSubmitContact } from '../../hooks/useContact';
import toast from 'react-hot-toast';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const containerRef = useRef(null);
  const heartRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    agree: false
  });

  const [activeFaq, setActiveFaq] = useState(null);

  // ✅ Candle-specific FAQs for Naisha Creation
  const faqs = [
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we ship across India. International shipping is something we are working on for the near future. Stay tuned to our social media for updates!"
    },
    {
      question: "Can I customize the scents for bulk orders?",
      answer: "Absolutely! For weddings, corporate events, or large parties, we offer bespoke scent curation and personalized packaging. Reach out via the form below."
    },
    {
      question: "Are your candles paraffin-free?",
      answer: "Yes, all Naisha Creation candles are made from 100% natural soy wax and lead-free cotton wicks, ensuring a clean, non-toxic burn for your home."
    },
    {
      question: "What is your return policy for damaged items?",
      answer: "If your candle arrives damaged, please email us a photo within 48 hours of delivery, and we will ship a replacement immediately at no extra cost."
    }
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
        ease: "power3.out"
      });

      gsap.from(".form-column", {
        scrollTrigger: {
          trigger: ".contact-section",
          start: "top 80%",
        },
        opacity: 0,
        x: 30,
        duration: 1,
        ease: "power3.out"
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
        ease: "power2.out"
      });

      // Heart Pulse
      gsap.to(heartRef.current, {
        scale: 1.2,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
        setFormData({ name: '', email: '', phone: '', message: '', agree: false });
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white font-sans text-[#1a1a1a] overflow-x-hidden">
      <PageBanner title="contact us" currentPage="Contact Us" />

      {/* Contact Section */}
      <div className="contact-section max-w-7xl mx-auto px-6 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        
        <div className="info-column space-y-8">
          <div>
            <h4 className="text-xs font-bold tracking-[0.2em] text-[#8c7851] mb-6 uppercase">Contact Us</h4>
            <h1 className="text-4xl md:text-6xl font-serif text-[#1a1a1a] leading-tight mb-6">
              Let's Start a <span className="italic text-[#8c7851]">Fragrant</span> Journey.
            </h1>
            <p className="text-[#666666] text-lg leading-relaxed max-w-lg">
              Whether you're looking for the perfect gift or need help choosing a scent for your sanctuary, our team is here to assist you.
            </p>
          </div>

          <div className="space-y-6 pt-4">
            <div onMouseEnter={(e) => handleIconHover(e, true)} onMouseLeave={(e) => handleIconHover(e, false)} className="flex items-center space-x-5 group cursor-pointer">
              <div className="icon-circle w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-[#8c7851] shadow-sm transition-colors">
                <MapPin size={20} />
              </div>
              <span className="text-[#444444] text-lg">Dehradun, Uttarakhand, India</span>
            </div>

            <div onMouseEnter={(e) => handleIconHover(e, true)} onMouseLeave={(e) => handleIconHover(e, false)} className="flex items-center space-x-5 group cursor-pointer">
              <div className="icon-circle w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-[#8c7851] shadow-sm transition-colors">
                <Phone size={20} />
              </div>
              <span className="text-[#444444] text-lg">+91 98765 43210</span>
            </div>

            <div onMouseEnter={(e) => handleIconHover(e, true)} onMouseLeave={(e) => handleIconHover(e, false)} className="flex items-center space-x-5 group cursor-pointer">
              <div className="icon-circle w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0 text-[#8c7851] shadow-sm transition-colors">
                <Mail size={20} />
              </div>
              <span className="text-[#444444] text-lg">hello@naishacreation.com</span>
            </div>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="form-column bg-[#fcfaf5] p-8 md:p-12 rounded-sm border border-stone-100 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              {[
                { name: 'name', icon: User, placeholder: 'Full Name', type: 'text' },
                { name: 'email', icon: Mail, placeholder: 'Email Address', type: 'email' },
                { name: 'phone', icon: Phone, placeholder: 'Phone Number', type: 'tel' },
              ].map((field) => (
                <div key={field.name} className="relative group">
                  <div className="absolute left-0 bottom-3 text-stone-400 group-focus-within:text-[#8c7851] transition-colors duration-300">
                    <field.icon size={18} />
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    required
                    placeholder={field.placeholder}
                    value={formData[field.name]}
                    onChange={handleChange}
                    className="w-full pl-8 pb-3 bg-transparent border-b border-stone-200 focus:border-[#8c7851] outline-none transition-all duration-300 placeholder:text-stone-400 text-lg font-light"
                  />
                </div>
              ))}

              <div className="relative group pt-4">
                <div className="absolute left-0 top-1 text-stone-400 group-focus-within:text-[#8c7851] transition-colors duration-300">
                  <Pencil size={18} />
                </div>
                <textarea
                  name="message"
                  required
                  placeholder="Tell us about your inquiry..."
                  value={formData.message}
                  onChange={handleChange}
                  rows="3"
                  className="w-full pl-8 pb-3 bg-transparent border-b border-stone-200 focus:border-[#8c7851] outline-none transition-all duration-300 placeholder:text-stone-400 text-lg font-light resize-none"
                ></textarea>
              </div>
            </div>

            <div className="flex flex-col space-y-6 pt-4">
              <div className="flex items-center space-x-3 text-stone-500">
                <input
                  type="checkbox"
                  id="agree"
                  name="agree"
                  checked={formData.agree}
                  onChange={handleChange}
                  className="w-4 h-4 accent-[#8c7851] cursor-pointer"
                />
                <label htmlFor="agree" className="text-sm cursor-pointer select-none font-light">
                  I agree to the <span className="underline hover:text-black">Privacy Policy</span>.
                </label>
              </div>

              <MainBtn 
                type="submit" 
                text="SEND MESSAGE" 
                className="w-full !bg-[#1a1a1a] !text-white hover:!bg-[#8c7851] transition-colors duration-500 py-4" 
              />
            </div>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="text-center mb-16">
          <h4 className="text-xs font-bold tracking-[0.2em] text-[#8c7851] mb-4 uppercase">Common Queries</h4>
          <h2 className="text-3xl md:text-5xl font-serif text-[#1a1a1a]">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item border-b border-stone-100 overflow-hidden bg-white">
              <button 
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full py-6 text-left flex justify-between items-center group cursor-pointer"
              >
                <span className={`text-lg md:text-xl font-medium transition-colors duration-300 ${activeFaq === index ? 'text-[#8c7851]' : 'text-[#1a1a1a]'}`}>
                  {faq.question}
                </span>
                <div className={`text-stone-400 transition-transform duration-500 ${activeFaq === index ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </button>
              
              <div className={`overflow-hidden transition-all duration-500 ease-in-out ${activeFaq === index ? 'max-h-[300px] opacity-100 pb-8' : 'max-h-0 opacity-0'}`}>
                <p className="text-stone-500 text-lg leading-relaxed font-light">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gifting Section */}
      <div className="gifting-section bg-[#fcfaf5] py-24 md:py-32 relative overflow-hidden border-t border-stone-100">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-serif italic text-[#1a1a1a] mb-8 leading-tight">
              Gifting Made <span className="text-[#8c7851]">Unforgettable</span>
            </h2>
            <p className="text-stone-500 text-lg md:text-xl leading-relaxed font-light">
              Candles are the ultimate gesture of warmth. From customized wedding favors to corporate gift sets, 
              Naisha Creation helps you leave a lasting impression with hand-poured luxury.
            </p>
            <div className="flex justify-center mt-12">
              <div ref={heartRef}>
                <Heart className="text-[#8c7851] fill-current" size={32} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}