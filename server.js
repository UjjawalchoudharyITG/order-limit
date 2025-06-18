const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

const corsOptions = {
  origin: 'https://newitt.myshopify.com',
  methods: ['GET', 'POST'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json()); // Required for parsing JSON POST body

const SHOPIFY_STORE = 'newitt.myshopify.com';
const ACCESS_TOKEN = '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';

// ✅ NEW: check-time-range endpoint
app.post('/check-time-range', async (req, res) => {
  const { date, fromTime, toTime } = req.body;

  if (!date || !fromTime || !toTime) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // 🔁 Combine date + time → ISO8601
    const start = new Date(`${date}T${fromTime}:00`);
    const end = new Date(`${date}T${toTime}:00`);

    // 👉 Optional: Adjust for your store's timezone if needed (e.g. subtract 5:30 for IST)
    // const offsetMinutes = 330; // IST offset
    // start.setMinutes(start.getMinutes() - offsetMinutes);
    // end.setMinutes(end.getMinutes() - offsetMinutes);

    const created_at_min = start.toISOString();
    const created_at_max = end.toISOString();

    const url = `https://${SHOPIFY_STORE}/admin/api/2023-07/orders.json`;

    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'any',
        created_at_min,
        created_at_max,
        fields: 'id,created_at'
      }
    });

    const orders = response.data.orders;
    res.json({ orderCount: orders.length, orders });

  } catch (error) {
    console.error('❌ Error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Existing route for default 2-hour rolling window (optional)
app.get('/check-limit', async (req, res) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const url = `https://${SHOPIFY_STORE}/admin/api/2023-07/orders.json`;
    const response = await axios.get(url, {
      headers: {
        'X-Shopify-Access-Token': ACCESS_TOKEN,
        'Content-Type': 'application/json'
      },
      params: {
        status: 'any',
        created_at_min: twoHoursAgo,
        fields: 'id'
      }
    });

    const orderCount = response.data.orders.length;
    const limit = 10;
    const allowCheckout = orderCount < limit;

    res.json({ allowCheckout, orderCount });
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Default route
app.get('/', (req, res) => {
  res.json({ message: 'API working' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
