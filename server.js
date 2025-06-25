// const express = require('express');
// const axios = require('axios');
// const app = express();
// app.use(express.json());

// const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
// const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
// const ORDER_LIMIT = 10;
// const TIME_WINDOW_HOURS = 2;

// function getTimeWindowISOString() {
//   const date = new Date(Date.now() - TIME_WINDOW_HOURS * 60 * 60 * 1000);
//   return date.toISOString();
// }

// app.get('/', async (req, res) => {

// });

// app.get('/check-limit', async (req, res) => {
//   try {
//     const since = getTimeWindowISOString();

//     const response = await axios.get(
//       `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?created_at_min=${since}&status=any&fields=id`,
//       {
//         headers: {
//           'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
//         },
//       }
//     );

//     const totalData = response.data;
//     const orderCount = response.data.orders.length;
//     const allowed = orderCount < ORDER_LIMIT;

//     res.json({ allowed, orderCount , totalData});
//   } catch (error) {
//     console.error(error?.response?.data || error.message);
//     res.status(500).json({ error: 'Failed to fetch orders' });
//   }
// });

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => console.log(`Listening on port ${PORT}`));



const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const SHOPIFY_ACCESS_TOKEN = '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';
const SHOPIFY_STORE = 'b2b-it-yokkao-com.myshopify.com';
const ORDER_LIMIT = 10;
const TIME_WINDOW_HOURS = 2;

if (!SHOPIFY_ACCESS_TOKEN || !SHOPIFY_STORE) {
  console.error('Missing Shopify credentials. Make sure SHOPIFY_ACCESS_TOKEN and SHOPIFY_STORE are set.');
  // process.exit(1);
}

function getTimeWindowISOString() {
  const date = new Date(Date.now() - TIME_WINDOW_HOURS * 60 * 60 * 1000);
  return date.toISOString();
}

app.get('/', (req, res) => {
  res.send('Shopify Order Limit Checker is running.');
});

app.get('/check-limit', async (req, res) => {
  try {
    const since = getTimeWindowISOString();

    const url = `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?status=any&fields=id`;

    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
      },
    });

    const orders = response.data.orders || [];
    const orderCount = orders.length;
    const allowed = orderCount < ORDER_LIMIT;

    res.json({ allowed, orderCount, orders });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
