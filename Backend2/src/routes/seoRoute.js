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
                xml += `    <loc>${baseUrl}/product/${product.slug}</loc>\n`;
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

export default router;