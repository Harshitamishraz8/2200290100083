const express = require('express');
const axios = require('axios');

const app = express();
const port = 9877;

const BASE_URL = 'http://20.244.56.144/evaluation-service/stocks';

// Cache for storing stock data
const stockCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function fetchStock(ticker, minutes) {
    try {
        const url = `${BASE_URL}/${ticker}?minutes=${minutes}`;
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error fetching stock data for ${ticker}:`, error.message);
        throw new Error(`Failed to fetch stock data for ${ticker}`);
    }
}

function calculateAverage(prices) {
    if (!prices || !prices.length) return 0;
    const total = prices.reduce((sum, entry) => sum + entry.price, 0);
    return parseFloat((total / prices.length).toFixed(6));
}

function calculateStandardDeviation(prices) {
    if (!prices || prices.length < 2) return 0;
    const mean = prices.reduce((sum, entry) => sum + entry.price, 0) / prices.length;
    const variance = prices.reduce((sum, entry) => sum + Math.pow(entry.price - mean, 2), 0) / (prices.length - 1);
    return Math.sqrt(variance);
}

function calculateCorrelation(pricesA, pricesB) {
    if (!pricesA || !pricesB || !pricesA.length || !pricesB.length) return 0;

    const len = Math.min(pricesA.length, pricesB.length);
    const meanA = calculateAverage(pricesA.slice(0, len));
    const meanB = calculateAverage(pricesB.slice(0, len));

    let covariance = 0;
    for (let i = 0; i < len; i++) {
        covariance += (pricesA[i].price - meanA) * (pricesB[i].price - meanB);
    }
    covariance /= (len - 1);

    const stdDevA = calculateStandardDeviation(pricesA.slice(0, len));
    const stdDevB = calculateStandardDeviation(pricesB.slice(0, len));

    if (stdDevA === 0 || stdDevB === 0) return 0;
    return parseFloat((covariance / (stdDevA * stdDevB)).toFixed(4));
}

app.get('/stocks/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const { minutes, aggregation } = req.query;

    if (!ticker || !minutes || isNaN(minutes) || minutes < 1) {
        return res.status(400).json({ error: 'Valid ticker and minutes parameters are required' });
    }

    if (aggregation !== 'average') {
        return res.status(400).json({ error: 'Only average aggregation is supported' });
    }

    try {
        const prices = await fetchStock(ticker, minutes);
        const avg = calculateAverage(prices);

        res.json({
            averageStockPrice: avg,
            priceHistory: prices
        });
    } catch (error) {
        console.error(`Error processing request for ${ticker}:`, error);
        res.status(500).json({ error: error.message || 'Failed to fetch stock data' });
    }
});

app.get('/stockcorrelation', async (req, res) => {
    const { ticker: tickers, minutes } = req.query;

    if (!tickers || !minutes || isNaN(minutes) || minutes < 1) {
        return res.status(400).json({ error: 'Two tickers and valid minutes parameter are required' });
    }

    const [t1, t2] = Array.isArray(tickers) ? tickers : tickers.split(',');

    if (!t1 || !t2) {
        return res.status(400).json({ error: 'Exactly two tickers are required' });
    }

    try {
        const [pricesA, pricesB] = await Promise.all([
            fetchStock(t1, minutes),
            fetchStock(t2, minutes)
        ]);

        const correlation = calculateCorrelation(pricesA, pricesB);

        res.json({
            correlation,
            stocks: {
                [t1]: {
                    averagePrice: calculateAverage(pricesA),
                    priceHistory: pricesA
                },
                [t2]: {
                    averagePrice: calculateAverage(pricesB),
                    priceHistory: pricesB
                }
            }
        });
    } catch (error) {
        console.error('Error processing correlation request:', error);
        res.status(500).json({ error: error.message || 'Failed to fetch stock data' });
    }
});

app.listen(port, () => {
    console.log(`Stock Aggregation Microservice running on port ${port}`);
}); 