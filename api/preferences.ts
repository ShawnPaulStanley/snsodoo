import type { VercelRequest, VercelResponse } from '@vercel/node';
import pool from '../db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST' || req.method === 'PUT') {
      const { userId, intent, spendingStyle, defaultCurrency } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Upsert preferences
      await pool.execute(
        `INSERT INTO user_preferences (user_id, intent, spending_style, default_currency)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         intent = VALUES(intent),
         spending_style = VALUES(spending_style),
         default_currency = VALUES(default_currency)`,
        [userId, intent, spendingStyle, defaultCurrency || 'USD']
      );

      return res.status(200).json({ success: true });
    }

    if (req.method === 'GET') {
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const [prefs] = await pool.execute(
        'SELECT * FROM user_preferences WHERE user_id = ?',
        [userId]
      );

      return res.status(200).json((prefs as any[])[0] || null);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Preferences API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
