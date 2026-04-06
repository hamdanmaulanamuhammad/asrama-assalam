import { Pool } from 'pg';

declare global {
  var postgresPool: Pool | undefined;
}

function getConnectionString() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  return connectionString;
}

export function getDb() {
  if (!global.postgresPool) {
    global.postgresPool = new Pool({
      connectionString: getConnectionString(),
    });
  }

  return global.postgresPool;
}
