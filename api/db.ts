import mysql from 'mysql2/promise';

// Database connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'trvl',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

// Initialize database tables
export async function initDatabase() {
  const connection = await pool.getConnection();
  try {
    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255),
        avatar VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // User preferences table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        user_id VARCHAR(36) PRIMARY KEY,
        intent VARCHAR(50),
        spending_style VARCHAR(50),
        default_currency VARCHAR(10) DEFAULT 'USD',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Trips table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trips (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATE,
        end_date DATE,
        cover_image VARCHAR(500),
        is_public BOOLEAN DEFAULT FALSE,
        intent VARCHAR(50),
        spending_style VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Trip stops (cities) table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS trip_stops (
        id VARCHAR(36) PRIMARY KEY,
        trip_id VARCHAR(36) NOT NULL,
        city_name VARCHAR(255) NOT NULL,
        country VARCHAR(255),
        lat DECIMAL(10, 8),
        lon DECIMAL(11, 8),
        arrival_date DATE,
        departure_date DATE,
        order_index INT DEFAULT 0,
        FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
      )
    `);

    // Activities table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS activities (
        id VARCHAR(36) PRIMARY KEY,
        stop_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        cost DECIMAL(10, 2) DEFAULT 0,
        currency VARCHAR(10) DEFAULT 'USD',
        duration_minutes INT,
        day_index INT DEFAULT 0,
        order_index INT DEFAULT 0,
        address VARCHAR(500),
        lat DECIMAL(10, 8),
        lon DECIMAL(11, 8),
        FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE
      )
    `);

    console.log('Database tables initialized successfully');
  } finally {
    connection.release();
  }
}
