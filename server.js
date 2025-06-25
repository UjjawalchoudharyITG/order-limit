const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;


const corsOptions = {
  origin: 'https://newitt.myshopify.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  credentials: true
};

app.use(cors(corsOptions)); // applies to all routes
app.use(express.json()); // Parse JSON bodies

// Shopify store config - use env vars in production!
const SHOPIFY_STORE = 'newitt.myshopify.com';
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || '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';

// POST /check-time-slots - accepts multiple slots [{date, fromTime, toTime}]
app.post('/check-limit', async (req, res) => {
    const { slots } = req.body;

  if (!slots || !Array.isArray(slots) || slots.length === 0) {
    return res.status(400).json({ error: 'Slots array is required' });
  }

  try {
    const results = await Promise.all(
      slots.map(async (slot) => {
        const { date, fromTime, toTime } = slot;
        if (!date || !fromTime || !toTime) {
          return { slot, error: 'Missing date or time' };
        }

        const created_at_min = new Date(`${date}T${fromTime}:00`).toISOString();
        const created_at_max = new Date(`${date}T${toTime}:00`).toISOString();

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
            fields: 'id'
          }
        });

        return {
          slot,
          orderCount: response.data.orders.length
        };
      })
    );

    res.json({ results });

  } catch (error) {
    console.error('❌ Error fetching orders:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Test route
app.get('/', (req, res) => {
  res.json({ message: '✅ API is working' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
