const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'https://newitt.myshopify.com',  // your Shopify store domain
  methods: 'GET,POST',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


const SHOPIFY_STORE = 'newitt.myshopify.com';
const ACCESS_TOKEN = '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';

app.get('/check-limit', async (req, res) => {
    
  try {
    // Calculate timestamp 2 hours ago in ISO8601
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    // Query orders created after twoHoursAgo
    const url = `https://${SHOPIFY_STORE}/admin/api/2023-07/orders.json?status=any`;

    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      }
    }); 

    const orders = response.data.orders;
    const orderCount = orders.length;
    const limit = 10;
    const allowCheckout = orderCount < limit;

    res.json({ allowCheckout , orders });
  } catch (error) { 
    console.error('Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});
app.get('/', (req, res) => {
  res.json({ message: 'API working' });
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
 