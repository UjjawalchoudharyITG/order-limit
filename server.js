const express = require('express');
const axios = require('axios');
const app = express();
const cors = require('cors');


app.use(cors({
  origin: 'https://newitt.myshopify.com',
}));

app.use(express.json());

const SHOPIFY_ACCESS_TOKEN = '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';
const SHOPIFY_STORE = 'b2b-it-yokkao-com.myshopify.com';


if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STORE) {
  console.error('Missing Shopify credentials. Make sure SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE are set.');
  // process.exit(1);
}


app.get('/', (req, res) => {
  res.send('Shopify Order Limit Checker is running.');
});

app.get('/check-limit', async (req, res) => {
  
  try {
    const url = `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?status=any&fields=id,created_at,updated_at`;
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const orders = response.data.orders || [];
    const orderCount = orders.length;
    const minimalOrders = orders.map(order => ({
        id: order.id,
        created_at: order.created_at,
        updated_at: order.updated_at
      }));
    res.json({ orderCount ,minimalOrders });

  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

async function checkShopifyOrders() {
  try {
    const since = getTimeWindowISOString();
    const url = `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?status=any&fields=id,created_at,updated_at`

    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const orders = response.data.orders || [];
    const orderCount = orders.length;

    orders.forEach(order => {
      console.log({
        id: order.id,
        created_at: order.created_at,
        updated_at: order.updated_at
      });
    });

    console.log(`Total Orders: ${orderCount}`);
  } catch (error) {
    console.error('❌ Error fetching orders:', error?.response?.data || error.message);
  }
}

checkShopifyOrders();

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
