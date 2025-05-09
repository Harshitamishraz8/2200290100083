require('dotenv').config();
const axios = require('axios');

async function getAccessToken() {
  try {
    const response = await axios.post(process.env.TOKEN_URL, {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET
    });

    const { access_token, expires_in } = response.data;
    console.log("✅ Access token received:", access_token);
    return access_token;
  } catch (error) {
    console.error("❌ Error fetching access token:", error.response?.data || error.message);
    throw error;
  }
}

module.exports = { getAccessToken };
