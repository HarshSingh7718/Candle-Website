import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import ProductData from '../assets/Data/ProductData.json';
import ProductZoom from '../components/ProductZoom';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';
import { Star, Heart, Repeat, ShoppingCart, Minus, Plus } from 'lucide-react';
import ProductCard from '../components/ui/Cards/ProductCard';
import PageBanner from '../components/ui/PageBanner';

const ShopDetails = () => {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const { liked, toggleWishlist } = useWishlist(product || {});
  
  const [qty, setQty] = useState(1);
  const [size, setSize] = useState('M');
  const [activeTab, setActiveTab] = useState('description');

  useEffect(() => {
    // Scroll to top on load
    window.scrollTo(0, 0);
    const found = ProductData.find(p => p.id === parseInt(id));
    setProduct(found);
    setQty(1); // reset qty on product change
  }, [id]);

  if (!product) return (
    <div className="min-h-[50vh] flex items-center justify-center pt-24 text-center">
      <div>
        <h2 className="text-3xl font-serif text-[#222] mb-4">Product Not Found</h2>
        <Link to="/#collections" className="text-[#ff5a5f] hover:underline">Return to Collections</Link>
      </div>
    </div>
  );

  const sizes = ['S', 'M', 'L'];
  const mockReviews = [
    { name: "sanjeev", date: "2024-11-27", rating: 5, text: "jkjkj" },
    { name: "18 18", date: "2024-11-27", rating: 4, text: "thank sir" },
    { name: "RH", date: "2024-11-25", rating: 5, text: "nice" }
  ];

  return (

      <div className="bg-light-yellow  pb-1">
          <PageBanner title="Shop Details" currentPage="Shop Details"  productName={product.title}/>
      <div className="container mx-auto py-10 px-4 lg:px-8 w-full">
          <ProductZoom product={product} />
        
        {/* Top Product Hero */}
       
        {/* Info Tabs Area */}
        <div className="flex flex-wrap gap-3 mb-4">
            <button 
              onClick={() => setActiveTab('description')}
              className={`px-6 py-2.5  text-sm font-semibold transition-all ${activeTab === 'description' ? 'bg-[black] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[black] hover:text-[black]'}`}
            >
              Description
            </button>
            <button 
              onClick={() => setActiveTab('additional')}
              className={`px-6 py-2.5  text-sm font-semibold transition-all ${activeTab === 'additional' ? 'bg-[black] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[black] hover:text-[black]'}`}
            >
              Additional Info
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-2.5  text-sm font-semibold transition-all ${activeTab === 'reviews' ? 'bg-[black] text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-[black] hover:text-[black]'}`}
            >
              Reviews (4)
            </button>
          </div>
        <div className="rounded-3xl p-6 md:p-10 mb-20 border border-gray-100 shadow-md">
          

          <div className="min-h-[150px]">
            {activeTab === 'description' && (
              <div className="text-gray-600 text-sm leading-relaxed animate-fade-in">
                <p>
                  Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.
                </p>
              </div>
            )}
            
            {activeTab === 'additional' && (
              <div className="text-gray-600 animate-fade-in text-sm">
                <table className="w-full max-w-lg text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 font-semibold w-1/3">Weight</th>
                      <td className="py-2">1.2 kg</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 font-semibold">Dimensions</th>
                      <td className="py-2">90 x 60 x 90 cm</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 font-semibold">Materials</th>
                      <td className="py-2">Soy Wax, Cotton Wick, Essential Oils</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-[#222] mb-6">Customer questions & answers</h3>
                
                <div className="space-y-6 mb-10">
                  {mockReviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-100 pb-5">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h4 className="font-semibold text-[#222]">{review.name}</h4>
                          <span className="text-xs text-gray-400">{review.date}</span>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < review.rating ? "#ffb400" : "none"} 
                              className={i < review.rating ? "text-[#ffb400]" : "text-gray-300"}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mt-2">{review.text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-light-yellow p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-[#222] mb-4">Add a review</h4>
                  <textarea 
                    className="w-full bg-light-yellow border border-gray-200 rounded-lg p-4 text-sm focus:outline-none focus:border-[black] transition-colors mb-4 resize-y" 
                    rows="4"
                    placeholder="Write a Review"
                  ></textarea>
                  <div className="flex items-center gap-1 mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={20} className="text-gray-300 hover:text-[#ffb400] cursor-pointer transition-colors" />
                    ))}
                  </div>
                  <button className="bg-[black] hover:bg-[black] text-white px-8 py-3 rounded-sm text-sm font-bold transition-all shadow-md">
                    Submit Review
                  </button>
                </div>
                
              </div>
            )}
          </div>
        </div>

        {/* Related Products */}
        <div>
          <h2 className="text-xl font-bold text-[#222] uppercase tracking-wide mb-8 border-b pb-3">Similar Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {ProductData.slice(0, 4).filter(p => p.id !== product.id).slice(0, 4).map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
            {/* Pad the row if filtering removed the current product */}
            {ProductData.slice(4, 5).map(p => ProductData.slice(0,4).some(e=>e.id === product.id) && (
               <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ShopDetails;
