import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';
import { v4 as uuidv4 } from 'uuid';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      // Login or register user
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      // Check if user exists
      const [existingUsers] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      let user;
      if ((existingUsers as any[]).length > 0) {
        // User exists, return it
        user = (existingUsers as any[])[0];
      } else {
        // Create new user
        const id = uuidv4();
        await pool.execute(
          'INSERT INTO users (id, email, name) VALUES (?, ?, ?)',
          [id, email, name || email.split('@')[0]]
        );
        user = { id, email, name: name || email.split('@')[0] };
      }

      // Get user preferences
      const [prefs] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [user.id]
      );

      return res.status(200).json({
        user,
        preferences: (prefs as any[])[0] || null
      });
    }

    if (req.method === 'GET') {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const [users] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      if ((users as any[]).length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = (users as any[])[0];

      // Get preferences
      const [prefs] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [user.id]
      );

      return res.status(200).json({
        user,
        preferences: (prefs as any[])[0] || null
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
