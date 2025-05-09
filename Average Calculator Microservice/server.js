const express = require('express');
const axios = require('axios');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const BASE_URL = 'http://20.244.56.144/evaluation-service';

// Store for numbers with window
let numberWindow = [];
let previousWindow = [];

// Map of number types to their API endpoints
const numberTypeEndpoints = {
    'p': '/primes',
    'f': '/fibo',
    'e': '/even',
    'r': '/rand'
};

async function fetchNumbers(type) {
    try {
        const response = await axios.get(`${BASE_URL}${numberTypeEndpoints[type]}`);
        return response.data.numbers;
    } catch (error) {
        console.error(`Error fetching ${type} numbers:`, error.message);
        return [];
    }
}

function updateWindow(newNumbers) {
    previousWindow = [...numberWindow];
    
    // Add new numbers to window, maintaining uniqueness
    newNumbers.forEach(num => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= WINDOW_SIZE) {
                numberWindow.shift(); // Remove oldest number
            }
            numberWindow.push(num);
        }
    });
}

function calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbers.length).toFixed(2));
}

app.get('/numbers/:type', async (req, res) => {
    const { type } = req.params;
    
    if (!numberTypeEndpoints[type]) {
        return res.status(400).json({ error: 'Invalid number type. Use p, f, e, or r' });
    }

    try {
        const newNumbers = await fetchNumbers(type);
        
        if (newNumbers.length === 0) {
            return res.status(500).json({ error: 'Failed to fetch numbers' });
        }

        updateWindow(newNumbers);
        
        res.json({
            windowPrevState: previousWindow,
            windowCurrState: numberWindow,
            numbers: newNumbers,
            avg: calculateAverage(numberWindow)
        });
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(port, () => {
    console.log(`Average Calculator Microservice running on port ${port}`);
}); 