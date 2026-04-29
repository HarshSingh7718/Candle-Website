import React from "react";
import { useQuery } from "@tanstack/react-query";
import API from "../../api";
import PageBanner from "../ui/PageBanner";
import CollectionsCard from "../../components/ui/Cards/CollectionsCard.jsx";

const Collections = () => {
  // 1. Fetch Categories/Collections from Backend
  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await API.get('/categories');
      return data.categories;
    }
  });

  // Fallback image in case a collection doesn't have one assigned
  const fallbackImage = "https://ekamonline.com/cdn/shop/files/1_fc58ac0c-c488-4ae7-b3d1-232b5f0f20ce.png?v=1772707496&width=900";

  return (
    <>
      <PageBanner title="Collections" currentPage="Collections" />
      <div className="bg-light-yellow">
        <div className="container py-[2%] mx-auto px-4 space-y-10 mb-14 md:pb-10">
          
          {/* Header Section */}
          <div className="feature-content section-container flex justify-center lg:items-center!">
            <div className="flex flex-col items-center mb-14 md:mb-16">
              <div className="w-24 h-1 bg-[#8c7851] mb-6"></div>
              <h2 className="text-4xl md:text-5xl font-serif text-[#8c7851] tracking-tight">
                Our Collections
              </h2>
              <p className="mt-4 text-[#8c7851]/70 text-center max-w-lg italic">
                Discover our curated sets of artisan fragrances, designed to
                transform your living space into a sanctuary.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-[#8c7851] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14 md:gap-x-8 md:gap-y-12">
              {collections.map((item) => (
                <CollectionsCard
                  key={item._id}
                  id={item._id}
                  image={item.image?.url || fallbackImage}
                  title={item.name}
                  description={item.description || "Handcrafted with premium wax and curated fragrance oils for a cleaner, longer-lasting burn."}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && collections.length === 0 && (
            <p className="text-center text-[#8c7851] italic py-20">
              New collections coming soon...
            </p>
          )}
        </div>
      </div>
    </>
  );
};

export default Collections;