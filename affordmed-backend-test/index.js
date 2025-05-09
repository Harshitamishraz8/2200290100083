const express = require('express');
const { getAccessToken } = require('./auth');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.get('/call-protected-api', async (req, res) => {
  try {
    const token = await getAccessToken();

    // Example call to a protected API (Replace with actual endpoint)
    const response = await axios.get('http://20.244.56.144/your-microservice-endpoint', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    res.json(response.data);
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
