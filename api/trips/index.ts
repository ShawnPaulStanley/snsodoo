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
    // GET all trips for a user or a specific trip
    if (req.method === 'GET') {
      const { userId, tripId, publicOnly } = req.query;

      if (tripId) {
        // Get specific trip with stops and activities
        const [trips] = await pool.execute(
          'SELECT * FROM trips WHERE id = ?',
          [tripId]
        );

        if ((trips as any[]).length === 0) {
          return res.status(404).json({ error: 'Trip not found' });
        }

        const trip = (trips as any[])[0];

        // Get stops
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

        trip.stops = stops;
        return res.status(200).json(trip);
      }

      if (publicOnly === 'true') {
        // Get all public trips
        const [trips] = await pool.execute(
          'SELECT * FROM trips WHERE is_public = TRUE ORDER BY created_at DESC'
        );
        return res.status(200).json(trips);
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Get all trips for user
      const [trips] = await pool.execute(
        'SELECT * FROM trips WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );

      // Get stops count for each trip
      for (const trip of trips as any[]) {
        const [stops] = await pool.execute(
          'SELECT COUNT(*) as count FROM trip_stops WHERE trip_id = ?',
          [trip.id]
        );
        trip.stopsCount = (stops as any[])[0].count;
      }

      return res.status(200).json(trips);
    }

    // POST - Create new trip
    if (req.method === 'POST') {
      const { userId, title, description, startDate, endDate, coverImage, isPublic, intent, spendingStyle } = req.body;

      if (!userId || !title) {
        return res.status(400).json({ error: 'User ID and title are required' });
      }

      const id = uuidv4();
      await pool.execute(
        `INSERT INTO trips (id, user_id, title, description, start_date, end_date, cover_image, is_public, intent, spending_style)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, title, description, startDate, endDate, coverImage, isPublic || false, intent, spendingStyle]
      );

      return res.status(201).json({ id, userId, title, description, startDate, endDate, coverImage, isPublic, intent, spendingStyle });
    }

    // PUT - Update trip
    if (req.method === 'PUT') {
      const { id, title, description, startDate, endDate, coverImage, isPublic, intent, spendingStyle } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }

      await pool.execute(
        `UPDATE trips SET title = ?, description = ?, start_date = ?, end_date = ?, cover_image = ?, is_public = ?, intent = ?, spending_style = ?
         WHERE id = ?`,
        [title, description, startDate, endDate, coverImage, isPublic, intent, spendingStyle, id]
      );

      return res.status(200).json({ success: true });
    }

    // DELETE - Delete trip
    if (req.method === 'DELETE') {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'Trip ID is required' });
      }

      await pool.execute('DELETE FROM trips WHERE id = ?', [id]);
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Trips API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
