import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET activities for a stop
    if (req.method === 'GET') {
      const { stopId } = req.query;

      if (!stopId) {
        return res.status(400).json({ error: 'Stop ID is required' });
      }

      const [activities] = await pool.execute(
        'SELECT * FROM activities WHERE stop_id = ? ORDER BY day_index, order_index',
        [stopId]
      );

      return res.status(200).json(activities);
    }

    // POST - Create new activity
    if (req.method === 'POST') {
      const { stopId, name, description, category, cost, currency, durationMinutes, dayIndex, orderIndex, address, lat, lon } = req.body;

      if (!stopId || !name) {
        return res.status(400).json({ error: 'Stop ID and name are required' });
      }

      const id = uuidv4();
      await pool.execute(
        `INSERT INTO activities (id, stop_id, name, description, category, cost, currency, duration_minutes, day_index, order_index, address, lat, lon)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, stopId, name, description, category, cost || 0, currency || 'USD', durationMinutes, dayIndex || 0, orderIndex || 0, address, lat, lon]
      );

      return res.status(201).json({ id, stopId, name, description, category, cost, currency, durationMinutes, dayIndex, orderIndex, address, lat, lon });
    }

    // PUT - Update activity
    if (req.method === 'PUT') {
      const { id, name, description, category, cost, currency, durationMinutes, dayIndex, orderIndex } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Activity ID is required' });
      }

      await pool.execute(
        `UPDATE activities SET name = ?, description = ?, category = ?, cost = ?, currency = ?, duration_minutes = ?, day_index = ?, order_index = ?
         WHERE id = ?`,
        [name, description, category, cost, currency, durationMinutes, dayIndex, orderIndex, id]
      );

      return res.status(200).json({ success: true });
    }

    // DELETE - Delete activity
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Activity ID is required' });
      }

      await pool.execute('DELETE FROM activities WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Activities API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
