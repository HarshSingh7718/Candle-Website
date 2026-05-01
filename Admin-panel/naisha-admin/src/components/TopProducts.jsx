const TopProducts = () => {
  const products = [
    {
      name: "Sandalwood & Amber",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAEx7hJqWqdB_QSkF8i84dDCSbDTzfcgVyubJNqljKiiuq8knsqs6WpnLAypPOTi_I1HLMnafcBKOJvoHE7Upgq_I9nQs8B7SGT2zwtZ_DxjhiMIpIt8ofzQgECX2trNqM82wgn6NXyN9Cah8-jtMNrDXcmJ8Fo-UlfHUci8pCNtXYNbZa38ujLDj63SqxoEvPkCjxAqP062VOCfMakn8VocYEoLTMii1bqM8rDTYjKKYOWhOeRqU85VYEx4o8uaIa2pXbt9Whdw7yY",
      sales: "428",
      revenue: "$14,980",
      alt: "Close up of a luxury amber glass candle jar on a marble surface"
    },
    {
      name: "Lavender Fields",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAP8sXn0nlP9c7GrL8sRy1yDnE8fcOrwabz6Q1Lc-arWYktTCHSNNXp3iAUXhkAKxV5fqYDdADHaaCe2-00aE1yxXm7WSb3bXUAZNBM3ht8q9Zubu9CDATU7zmaeVZG0jWvT3v5u31NUZHPe8qYMjyb-Lqn1OnGNgQw-wQG_os-UUiE1KaPQZShLmXkOjQ7l-dSWATl63D4xihAZ6ATRqMpbu4bpEzQ1GmOrWAvDrQRRKslD5EoWw8v1B2CSazkX4d65vFFQ0JiiLqL",
      sales: "312",
      revenue: "$10,920",
      alt: "Minimalist white ceramic candle on a wooden table with soft lighting"
    },
    {
      name: "Bergamot Night",
      image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-v65nFggALsQdFAE1IdI9qyACYCJtCg7Y26kwOBj1_W1bMsUrb8NkEIn6DRVJgYI3F_Qvu-N2QQ_1kdg71AHx7M1C9cOD2pyyQxlgcKk9UWyhs08eup0dPBZw9NsqqznaI40_DQSDOL1qrXQuAJOQ6jEaeBPiOfnV5LgmwrpV3cqlGlpV1GaUyCOYtrqZF8bn82kMsuJBewzI1s60eYSHU01ONCieDXUWBmYaXNzqATpxKzGqJMfEVuF9d7GBqhcNuliJDPk3Gf31",
      sales: "285",
      revenue: "$9,975",
      alt: "Dark moody photograph of a black matte candle jar with a lit wick"
    }
  ];

  return (
    <div className="table-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Top Products</h3>
        <button className="text-primary font-label-md text-label-md hover:underline">View All</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              <th className="pb-3 pr-4 font-semibold">Product</th>
              <th className="pb-3 px-4 font-semibold">Sales</th>
              <th className="pb-3 pl-4 font-semibold text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-background">
            {products.map((product, index) => (
              <tr key={index} className="border-b border-surface-container/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 pr-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                    <img alt={product.name} className="w-full h-full object-cover" data-alt={product.alt} src={product.image}/>
                  </div>
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="py-4 px-4 text-on-surface-variant">{product.sales}</td>
                <td className="py-4 pl-4 text-right font-medium">{product.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;
