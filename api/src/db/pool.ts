import { Pool, QueryResult } from 'pg';
import config from '../config/config';
import logger from '../config/logger';

const pool = new Pool({
  database: config.database.name,
  user: config.database.username,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  ...(config.env === 'development' && { log: (msg) => logger.info(msg) }),
});

const query = async (text: string, params: Array<any>): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

const instance = pool;

const init = async (): Promise<QueryResult<any>> => {
  await pool.connect();

  return pool.query(
    `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL NOT NULL PRIMARY KEY,
      name character varying NOT NULL, 
      age integer NOT NULL
    );
  `
  );
};

export { query, init, instance };
