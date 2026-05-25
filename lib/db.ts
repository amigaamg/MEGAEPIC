/**
 * AMEXAN — MySQL Database Client
 *
 * DROP THIS at: lib/db.ts
 *
 * Uses mysql2 with connection pooling.
 * Install: npm install mysql2
 *
 * Set these in your .env.local:
 *   DB_HOST=localhost
 *   DB_PORT=3306
 *   DB_USER=your_mysql_user
 *   DB_PASSWORD=your_mysql_password
 *   DB_NAME=amexan
 */

import mysql, { Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";

// ─── CONNECTION POOL ──────────────────────────────────────────
// Pool is created once and reused across all requests.
// Next.js hot-reload safe via global caching.

declare global {
  // eslint-disable-next-line no-var
  var __amexanPool: Pool | undefined;
}

function createPool(): Pool {
  return mysql.createPool({
    host:               process.env.DB_HOST     ?? "localhost",
    port:               parseInt(process.env.DB_PORT ?? "3306"),
    user:               process.env.DB_USER     ?? "root",
    password:           process.env.DB_PASSWORD ?? "",
    database:           process.env.DB_NAME     ?? "amexan",
    waitForConnections: true,
    connectionLimit:    10,
    queueLimit:         0,
    timezone:           "+00:00",   // always store/return UTC
    decimalNumbers:     true,
    // Return JSON columns as parsed objects, not strings
    typeCast: (field, next) => {
      if (field.type === "JSON") {
        const val = field.string();
        if (val === null) return null;
        try { return JSON.parse(val); } catch { return val; }
      }
      if (field.type === "TINY" && field.length === 1) {
        return field.string() === "1";
      }
      return next();
    },
  });
}

// Singleton — reuse across hot reloads in development
const pool: Pool =
  process.env.NODE_ENV === "production"
    ? createPool()
    : (global.__amexanPool ?? (global.__amexanPool = createPool()));

// ─── TYPED QUERY HELPERS ──────────────────────────────────────

/**
 * Run a SELECT query, returns typed rows.
 * Usage: const rows = await query<Patient>("SELECT * FROM patients WHERE id = ?", [id])
 */
export async function query<T extends RowDataPacket>(
  sql: string,
  values?: unknown[]
): Promise<T[]> {
  const [rows] = await pool.execute<T[]>(sql, values as any);
  return rows;
}

/**
 * Run an INSERT / UPDATE / DELETE, returns result metadata.
 * Usage: const result = await execute("INSERT INTO ...", [...])
 *        result.insertId — for AUTO_INCREMENT tables
 *        result.affectedRows — rows changed
 */
export async function execute(
  sql: string,
  values?: unknown[]
): Promise<ResultSetHeader> {
  const [result] = await pool.execute<ResultSetHeader>(sql, values as any);
  return result;
}

/**
 * Run multiple statements in a transaction.
 * Automatically rolls back on error.
 * Usage:
 *   await transaction(async (conn) => {
 *     await conn.execute("INSERT INTO ...", [...]);
 *     await conn.execute("UPDATE ...", [...]);
 *   });
 */
export async function transaction<T>(
  fn: (conn: Awaited<ReturnType<Pool["getConnection"]>>) => Promise<T>
): Promise<T> {
  const conn = await pool.getConnection();
  await conn.beginTransaction();
  try {
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

/**
 * Get a single row or null.
 * Usage: const patient = await queryOne<Patient>("SELECT * FROM patients WHERE id = ?", [id])
 */
export async function queryOne<T extends RowDataPacket>(
  sql: string,
  values?: unknown[]
): Promise<T | null> {
  const rows = await query<T>(sql, values);
  return rows[0] ?? null;
}

export default pool;