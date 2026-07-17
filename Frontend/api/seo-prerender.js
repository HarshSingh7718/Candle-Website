export const escapeHTML = (str) => {
  if (!str) return '';
  return String(str).replace(/[&<>"']/g, (match) => {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return map[match];
  });
};

export const truncate = (str, length = 155) => {
  if (!str) return '';
  const text = String(str);
  if (text.length <= length) return text;
  return text.slice(0, length - 3) + '...';
};

export default async function handler(req, res) {
  const url = new URL(req.url, `https://${req.headers.host}`);
  const pathname = url.pathname;
  
  const backendUrl = process.env.VITE_BACKEND_URL;
  if (!backendUrl) {
    // Fail safe: if no backend URL is set, let Vercel handle it normally or return basic empty layout
    return res.status(200).send(`<!DOCTYPE html><html><head><title>Naisha Creations</title></head><body></body></html>`);
  }

  let title = "Naisha Creations";
  let description = "Naisha Creations brings you candles that are more than just wax and wick. Poured by hand with organic ingredients to elevate your everyday rituals.";
  let image = "https://naishacreations.com/logo.png"; // fallback logo
  let type = "website";

  try {
    if (pathname.includes('/product/')) {
      // Product page
      const slug = pathname.split('/').pop();
      // CORRECT URL: /api/product/:slug
      const response = await fetch(`${backendUrl}/api/product/${slug}`);
      if (response.ok) {
        const { product } = await response.json();
        title = `${product.name} | Naisha Creations`;
        description = product.description;
        image = product.images?.[0]?.url || image;
        type = "product";
      }
    } else if (pathname.includes('/collections/') && !pathname.endsWith('/collections')) {
      // Collection category page
      const slug = pathname.split('/').pop();
      title = `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} | Naisha Creations`;
      description = `Discover our full range of ${title} candles. Hand-poured with eco-friendly soy wax and premium fragrance oils.`;
    } else if (pathname.endsWith('/collections')) {
      // All Collections page
      title = "All Collections | Naisha Creations";
    }

    // Escape and truncate
    const safeTitle = escapeHTML(title);
    const safeDesc = escapeHTML(truncate(description));
    const safeImage = escapeHTML(image);

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          
          <title>${safeTitle}</title>
          <meta name="description" content="${safeDesc}" />
          
          <meta property="og:title" content="${safeTitle}" />
          <meta property="og:description" content="${safeDesc}" />
          <meta property="og:image" content="${safeImage}" />
          <meta property="og:type" content="${type}" />
          <meta property="og:url" content="${escapeHTML(url.href)}" />
          
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${safeTitle}" />
          <meta name="twitter:description" content="${safeDesc}" />
          <meta name="twitter:image" content="${safeImage}" />
        </head>
        <body>
          <h1>${safeTitle}</h1>
          <p>${escapeHTML(description)}</p>
        </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    return res.status(200).send(html);
    
  } catch (error) {
    console.error('SEO Prerender Error:', error);
    return res.status(200).send(`<!DOCTYPE html><html><head><title>Naisha Creations</title></head><body></body></html>`);
  }
}
