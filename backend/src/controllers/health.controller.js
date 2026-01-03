import { getHealthStatus } from '../services/health.service.js';

export function healthCheck(req, res, next) {
  try {
    const status = getHealthStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
}
