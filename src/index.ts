import express from 'express';
import path from 'path';
const swaggerUi = require('swagger-ui-express');
import { securityMiddleware, configMiddleware } from '../shared/middleware-service';
import systemController from './infrastructure/adapters/http/SystemController';

const app = express();
app.use(express.json());
app.use(securityMiddleware);
app.use(configMiddleware);

// Serve swagger JSON for frontend
app.get('/swagger.json', (req, res) => {
  res.sendFile(path.resolve(__dirname, './swagger/swagger.json'));
});

// Swagger UI route (optional)
try {
  const swaggerDocument = require('./swagger/swagger.json');
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (err) {
  console.warn('Swagger UI not configured: ', err.message);
}

app.use('/', systemController);
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'system-service', version: '1.0.0' });
});

app.listen(3003, () => console.log('System Service running on port 3003'));
