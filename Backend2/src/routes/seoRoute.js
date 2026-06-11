import express from 'express';
import {Product} from '../models/productModels.js';
import {Category} from '../models/categoryModel.js';

const router = express.Router();

router.get('/sitemap.xml', async (req, res) => {
    try {
        // Your main frontend URL
        const baseUrl = process.env.FRONTEND_URL || 'https://naishacreations.com';

        // 1. Define Static Routes
        const staticRoutes = [
            '',
            '/about',
            '/collections',
            '/collections/candles',
            '/customized',
            '/contact',
            '/privacy-policy',
            '/term-of-service'
        ];

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // 2. Inject Static Routes
        staticRoutes.forEach((route) => {
            xml += `  <url>\n`;
            xml += `    <loc>${baseUrl}${route}</loc>\n`;
            xml += `    <changefreq>weekly</changefreq>\n`;
            xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;
            xml += `  </url>\n`;
        });

        // 3. Fetch Dynamic Products
        const products = await Product.find({ isActive: true }).select('slug updatedAt').lean();

        products.forEach((product) => {
            if (product.slug) {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/collections/candles/product/${product.slug}</loc>\n`;
                xml += `    <lastmod>${(product.updatedAt || new Date()).toISOString()}</lastmod>\n`;
                xml += `    <changefreq>daily</changefreq>\n`;
                xml += `    <priority>0.9</priority>\n`;
                xml += `  </url>\n`;
            }
        });

        // 4. Fetch Dynamic Categories
        const categories = await Category.find({}).select('slug').lean();

        categories.forEach((category) => {
            if (category.slug) {
                xml += `  <url>\n`;
                xml += `    <loc>${baseUrl}/collections/${category.slug}</loc>\n`;
                xml += `    <changefreq>weekly</changefreq>\n`;
                xml += `    <priority>0.7</priority>\n`;
                xml += `  </url>\n`;
            }
        });

        xml += '</urlset>';

        // 5. Send the XML response
        res.header('Content-Type', 'application/xml');
        res.send(xml);

    } catch (error) {
        console.error("Sitemap generation error:", error);
        res.status(500).send("Error generating sitemap");
    }
});

router.get('/google-shopping-feed.xml', async (req, res) => {
    try {
        const baseUrl = process.env.FRONTEND_URL || 'https://naishacreations.com';
        const products = await Product.find({ isActive: true }).lean();

        let xml = '<?xml version="1.0" encoding="utf-8"?>\n';
        xml += '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">\n';
        xml += '  <channel>\n';
        xml += '    <title>Naisha Creations</title>\n';
        xml += '    <link>' + baseUrl + '</link>\n';
        xml += '    <description>Premium Scented Candles and Wax Melts</description>\n';

        const escapeXml = (str) => {
            if (!str) return '';
            return str
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&apos;');
        };

        products.forEach((product) => {
            const productUrl = `${baseUrl}/collections/candles/product/${product.slug}`;
            const imageUrl = product.images?.[0]?.url || `${baseUrl}/placeholder.jpg`;
            const price = product.effectivePrice;
            const description = product.description || '';
            const availability = product.stock > 0 ? 'in_stock' : 'out_of_stock';

            xml += '    <item>\n';
            xml += `      <g:id>${product._id}</g:id>\n`;
            xml += `      <g:title>${escapeXml(product.name)}</g:title>\n`;
            xml += `      <g:description>${escapeXml(description)}</g:description>\n`;
            xml += `      <g:link>${productUrl}</g:link>\n`;
            xml += `      <g:image_link>${imageUrl}</g:image_link>\n`;
            xml += `      <g:availability>${availability}</g:availability>\n`;
            xml += `      <g:price>${price} INR</g:price>\n`;
            xml += '      <g:brand>Naisha Creations</g:brand>\n';
            xml += '      <g:condition>new</g:condition>\n';
            xml += '      <g:identifier_exists>no</g:identifier_exists>\n';
            xml += '    </item>\n';
        });

        xml += '  </channel>\n';
        xml += '</rss>';

        res.header('Content-Type', 'application/xml');
        res.send(xml);
    } catch (error) {
        console.error("Google Shopping feed generation error:", error);
        res.status(500).send("Error generating Google Shopping feed");
    }
});

export default router;