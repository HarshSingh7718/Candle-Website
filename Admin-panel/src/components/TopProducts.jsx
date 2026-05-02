const TopProducts = ({ products = [] }) => {
  return (
    <div className="table-container bg-surface rounded-xl p-6 border border-surface-container shadow-sm shadow-stone-200/50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-heading text-headline-md text-on-background">Top Products</h3>
      </div>
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-surface-container font-label-md text-label-md text-on-surface-variant uppercase tracking-wide">
              <th className="pb-3 pr-4 font-semibold">Product</th>
              <th className="pb-3 px-4 font-semibold">Rating</th>
              <th className="pb-3 pl-4 font-semibold text-right">Price</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-body-md text-on-background">
            {products.map((product) => (
              <tr key={product._id} className="border-b border-surface-container/50 last:border-0 hover:bg-surface-container-lowest transition-colors">
                <td className="py-4 pr-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-surface-container overflow-hidden">
                    <img alt={product.name} className="w-full h-full object-cover" src={product.images[0].url || 'placeholder.jpg'} />
                  </div>
                  <span className="font-medium">{product.name}</span>
                </td>
                <td className="py-4 px-4 text-yellow-500">★ {product.ratings || 0}</td>
                <td className="py-4 pl-4 text-right font-medium">₹{product.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TopProducts;