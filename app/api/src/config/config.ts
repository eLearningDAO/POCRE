import dotenv from 'dotenv';
import path from 'path';
import Joi from 'joi';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string().valid('production', 'development', 'test').required(),
    PORT: Joi.number().default(3000),
    DATABASE_HOST: Joi.string().description('database host to be used by api').required(),
    DATABASE_PORT: Joi.string().description('database port to be used by api').required(),
    DATABASE_NAME: Joi.string().description('database name to be used by api').required(),
    DATABASE_USERNAME: Joi.string().description('database username to be used by api').required(),
    DATABASE_PASSWORD: Joi.string().description('database password to be used by api').required(),
    DOCS_SERVER_URL: Joi.string().description('the server on which swagger docs live').required(),
    MIN_LITIGATORS: Joi.number().description('min litigators per litigation').required().min(1),
    MAX_LITIGATORS: Joi.number().description('max litigators per litigation').required().min(2),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema.prefs({ errors: { label: 'key' } }).validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  database: {
    host: envVars.DATABASE_HOST,
    port: envVars.DATABASE_PORT,
    name: envVars.DATABASE_NAME,
    username: envVars.DATABASE_USERNAME,
    password: envVars.DATABASE_PASSWORD,
  },
  docs_server_url: envVars.DOCS_SERVER_URL,
  litigators: {
    min: envVars.MIN_LITIGATORS,
    max: envVars.MAX_LITIGATORS,
  },
};
