const express = require("express");
const axios = require("axios");

const app = express();
const port = 9876;

const BASE_URL = "http://20.244.56.144/evaluation-service/stocks";

async function fetchStock(ticker, minutes) {
  const url = `${BASE_URL}/${ticker}?minutes=${minutes}`;
  const res = await axios.get(url);
  return res.data.prices;
}

function average(prices) {
  if (!prices.length) return 0;
  const total = prices.reduce((sum, entry) => sum + entry.price, 0);
  return total / prices.length;
}

function standardDeviation(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + (val - mean) ** 2, 0) / arr.length;
  return Math.sqrt(variance);
}

function pearsonCorrelation(pricesA, pricesB) {
  const len = Math.min(pricesA.length, pricesB.length);
  const a = pricesA.slice(0, len).map(p => p.price);
  const b = pricesB.slice(0, len).map(p => p.price);

  const meanA = average(pricesA);
  const meanB = average(pricesB);

  const numerator = a.reduce((acc, val, i) => acc + ((val - meanA) * (b[i] - meanB)), 0);
  const denominator = standardDeviation(a) * standardDeviation(b) * len;

  return denominator ? numerator / denominator : 0;
}

app.get("/stocks/:ticker", async (req, res) => {
  const { ticker } = req.params;
  const { minutes, aggregation } = req.query;

  if (!ticker || !minutes || aggregation !== "average")
    return res.status(400).json({ error: "Missing or invalid parameters" });

  try {
    const prices = await fetchStock(ticker, minutes);
    const avg = average(prices);
    res.json({ ticker, avgPrice: parseFloat(avg.toFixed(2)) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.get("/stockcorrelation", async (req, res) => {
  const { ticker: tickers, minutes } = req.query;

  if (!tickers || tickers.length !== 2 || !minutes)
    return res.status(400).json({ error: "Two tickers and minutes required" });

  const [t1, t2] = Array.isArray(tickers) ? tickers : tickers.split(",");

  try {
    const [pricesA, pricesB] = await Promise.all([
      fetchStock(t1, minutes),
      fetchStock(t2, minutes)
    ]);

    const correlation = pearsonCorrelation(pricesA, pricesB);

    res.json({
      ticker1: t1,
      ticker2: t2,
      correlation: parseFloat(correlation.toFixed(4))
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock data" });
  }
});

app.listen(port, () => {
  console.log(`Stock microservice running on port ${port}`);
});
