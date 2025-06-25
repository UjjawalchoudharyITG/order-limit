const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

const SHOPIFY_ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const SHOPIFY_STORE = process.env.SHOPIFY_STORE;
const ORDER_LIMIT = 10;
const TIME_WINDOW_HOURS = 2;

function getTimeWindowISOString() {
  const date = new Date(Date.now() - TIME_WINDOW_HOURS * 60 * 60 * 1000);
  return date.toISOString();
}

app.get('/check-limit', async (req, res) => {
  try {
    const since = getTimeWindowISOString();

    const response = await axios.get(
      `https://${SHOPIFY_STORE}/admin/api/2023-10/orders.json?created_at_min=${since}&status=any&fields=id`,
      {
        headers: {
          'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        },
      }
    );

    const orderCount = response.data.orders.length;
    const allowed = orderCount < ORDER_LIMIT;

    res.json({ allowed, orderCount });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
