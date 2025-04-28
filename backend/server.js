// backend/metricsServer.js
const express = require('express');
const cors = require('cors');
const promClient = require('prom-client');

const app = express();
const port = 5001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Create a Prometheus counter for frontend events
const eventCounter = new promClient.Counter({
  name: 'frontend_events_total',
  help: 'Total number of frontend events',
  labelNames: ['event', 'page'],
});

const register = new promClient.Registry();
register.registerMetric(eventCounter);

app.post('/track', (req, res) => {
  const { event, page } = req.body;

  if (!event || !page) {
    return res.status(400).send('Missing event or page');
  }

  // Increment the counter with labels
  eventCounter.labels(event, page).inc();

  return res.status(200).send('Event tracked');
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

app.listen(port, () => {
  console.log(`Metrics server listening at http://localhost:${port}`);
});
