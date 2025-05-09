const express = require("express");
const axios = require("axios");

const app = express();
const port = 9876;

const windowSize = 10;
const numberStore = [];

const numberEndpoints = {
  p: "http://20.244.56.144/numbers/primes",
  f: "http://20.244.56.144/numbers/fibo",
  e: "http://20.244.56.144/numbers/even",
  r: "http://20.244.56.144/numbers/rand"
};

function getAverage(arr) {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

app.get("/numbers/:numberid", async (req, res) => {
  const id = req.params.numberid;
  const url = numberEndpoints[id];

  if (!url) return res.status(400).json({ error: "Invalid number ID" });

  let response;
  try {
    response = await axios.get(url, { timeout: 500 });
  } catch (err) {
    return res.status(500).json({ error: "Failed to fetch numbers" });
  }

  const newNumbers = response.data.numbers || [];
  const windowPrevState = [...numberStore];

  newNumbers.forEach((num) => {
    if (!numberStore.includes(num)) {
      numberStore.push(num);
      if (numberStore.length > windowSize) {
        numberStore.shift(); // remove oldest
      }
    }
  });

  const avg = getAverage(numberStore);
  res.json({
    windowPrevState,
    windowCurrState: numberStore,
    numbers: newNumbers,
    avg: parseFloat(avg.toFixed(2))
  });
});

app.listen(port, () => {
  console.log(`Average calculator running on port ${port}`);
});
