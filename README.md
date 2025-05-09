# Backend Microservices

This repository contains two microservices:

1. Average Calculator Microservice (Port: 9876)
2. Stock Aggregation Microservice (Port: 9877)

## Setup

For each microservice:

1. Navigate to the microservice directory:
   ```bash
   cd <microservice-directory>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Average Calculator Microservice

Endpoint: `GET /numbers/:type`

Parameters:
- `type`: One of 'p' (prime), 'f' (fibonacci), 'e' (even), 'r' (random)

Example:
```bash
curl http://localhost:9876/numbers/e
```

## Stock Aggregation Microservice

Endpoints:

1. Get Average Stock Price:
   ```
   GET /stocks/:ticker?minutes=m&aggregation=average
   ```

2. Get Stock Correlation:
   ```
   GET /stockcorrelation?minutes=m&ticker=TICKER1&ticker=TICKER2
   ```

Example:
```bash
curl http://localhost:9877/stocks/NVDA?minutes=50&aggregation=average
curl http://localhost:9877/stockcorrelation?minutes=50&ticker=NVDA&ticker=PYPL
``` 