import mysql from "mysql2/promise";

declare global {
  // eslint-disable-next-line no-var
  var _adminDbPool: mysql.Pool | undefined;
}

const pool =
  global._adminDbPool ??
  mysql.createPool({
    host: process.env.host,
    port: process.env.port ? parseInt(process.env.port) : 3306,
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    waitForConnections: true,
    connectionLimit: 5,
  });

if (process.env.NODE_ENV !== "production") {
  global._adminDbPool = pool;
}

export { pool };
