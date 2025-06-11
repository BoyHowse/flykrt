const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/api/scrape', async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'No se proporcionó una URL' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const hostname = new URL(url).hostname;

    let result;

    // WhatsApp catalogs
    if (hostname.includes('wa.me') || hostname.includes('whatsapp.com')) {
      result = await page.evaluate(() => {
        const ogTitle = document.querySelector('meta[property="og:title"]')?.content;
        const ogImage = document.querySelector('meta[property="og:image"]')?.content;
        const ogDesc = document.querySelector('meta[property="og:description"]')?.content;

        const priceMatch = ogDesc?.match(/\$?\s?(\d[\d.,]*)/);
        const price = priceMatch ? parseInt(priceMatch[1].replace(/[^\d]/g, '')) : 0;

        return {
          name: ogTitle || 'Producto de WhatsApp',
          price: price,
          shipping: 0,
          image: ogImage || null,
        };
      });
    } else {
      await page.click('button[name="add"]');
      await page.waitForTimeout(2000);

      await page.goto('https://stradabrand.co/cart');
      await page.waitForTimeout(3000);

      result = await page.evaluate(() => {
        const priceText = document.querySelector('[class*="price"], [class*="valor"], [class*="precio"]');
        const nameText = document.querySelector('h1, h2, .product-title, .nombre');
        const image = document.querySelector('img')?.src;

        const price = priceText?.innerText?.replace(/[^\d]/g, '') || '0';
        const name = nameText?.innerText || 'Producto colombiano';

        const shippingText = document.body.innerText;
        const shippingMatch = shippingText.match(/env[ií]o\s?:?\s?\$?\s?(\d[\d.,]*)/i);
        const shipping = shippingMatch ? parseInt(shippingMatch[1].replace(/[^\d]/g, '')) : 0;

        return {
          name,
          price: parseInt(price),
          shipping,
          image,
        };
      });
    }

    await browser.close();
    res.json(result);
  } catch (error) {
    console.error('Error en scraping:', error);
    res.status(500).json({ error: 'Error al procesar la página' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend FLYKRT corriendo en http://localhost:${PORT}`);
});