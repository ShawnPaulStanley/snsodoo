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
    // GET stops for a trip
    if (req.method === 'GET') {
      const { tripId } = req.query;

      if (!tripId) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }

      const [stops] = await pool.execute(
        'SELECT * FROM trip_stops WHERE trip_id = ? ORDER BY order_index',
        [tripId]
      );

      // Get activities for each stop
      for (const stop of stops as any[]) {
        const [activities] = await pool.execute(
          'SELECT * FROM activities WHERE stop_id = ? ORDER BY day_index, order_index',
          [stop.id]
        );
        stop.activities = activities;
      }

      return res.status(200).json(stops);
    }

    // POST - Create new stop
    if (req.method === 'POST') {
      const { tripId, cityName, country, lat, lon, arrivalDate, departureDate, orderIndex } = req.body;

      if (!tripId || !cityName) {
        return res.status(400).json({ error: 'Trip ID and city name are required' });
      }

      const id = uuidv4();
      await pool.execute(
        `INSERT INTO trip_stops (id, trip_id, city_name, country, lat, lon, arrival_date, departure_date, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, tripId, cityName, country, lat, lon, arrivalDate, departureDate, orderIndex || 0]
      );

      return res.status(201).json({ id, tripId, cityName, country, lat, lon, arrivalDate, departureDate, orderIndex });
    }

    // DELETE - Delete stop
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Stop ID is required' });
      }

      await pool.execute('DELETE FROM trip_stops WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Stops API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
