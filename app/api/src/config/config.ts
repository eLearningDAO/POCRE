import dotenv from 'dotenv';
import Joi from 'joi';
import path from 'path';

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
    CREATION_DETAILS_WEB_BASE_URL: Joi.string()
      .description('the base url of web app where creation details are shown')
      .required(),
    MIN_LITIGATORS: Joi.number().description('min litigators per litigation').required().min(1),
    MAX_LITIGATORS: Joi.number().description('max litigators per litigation').required().min(2),
    LITIGATION_VOTING_DAYS: Joi.number().description('voting days for a litigation, must be more than 2').required().min(3),
    LITIGATION_RECONCILATION_DAYS: Joi.number()
      .description('reconcilation days for a litigation, must be more than 2')
      .required()
      .min(3),
    ENABLE_LITIGATION_JURY_SELECTION_ALGO: Joi.boolean()
      .description('let the system know whether to pick default judges or ones that have reputation stars')
      .required(),
    LITIGATION_JURY_REQUIRED_STARS: Joi.number()
      .description('stars required for a user to be a litigation jury member')
      .required(),
    JWT_SECRET: Joi.string().required().description('JWT secret key'),
    HASHING_SALT_WALLET_ADDRESS: Joi.string().required().description('Hasing Salt for wallet address'),
    SENDGRID_MAIL_API_KEY: Joi.string().description('sendgrid api key used to send emails').required(),
    SENDGRID_MAIL_FROM_NAME: Joi.string().description('sendgrid mail from name used to send emails').required(),
    SENDGRID_MAIL_FROM_EMAIL: Joi.string().description('sendgrid mail from email used to send emails').required(),
    SENDGRID_MAIL_INVITE_TEMPLATE_ID: Joi.string().description('sendgrid invitation email template id').required(),
    WEB_CLIENT_BASE_URL: Joi.string().description('web client base url').required(),
    PINATA_JWT_SECRET: Joi.string().description('pinata jwt secret used to store data on ipfs').required(),
    PINATA_API_JSON_PIN_URL: Joi.string().description('pinata api url to pin json data').required(),
    PINATA_API_UNPIN_URL: Joi.string().description('pinata api url to unpin data').required(),
    BLOCKFROST_PROJECT_ID: Joi.string().description('blockfrost project id to interact with their service').required(),
    BLOCKFROST_API_BASE_URL: Joi.string().description('blockfrost base url to make http calls').required(),
    BLOCKFROST_API_TRANSACTIONS_ENDPOINT: Joi.string().description('blockfrost endpoint to query transactions').required(),
    BLOCKFROST_API_BLOCKS_ENDPOINT: Joi.string().description('blockfrost endpoint to query blocks').required(),
    BLOCKFROST_WEBHOOK_AUTH_TOKEN: Joi.string()
      .description('blockfrost webhook token to verify webhooks signature')
      .required(),
    MIN_BLOCK_CONFIRMATIONS_FOR_VALID_CRYPTO_TRANSACTION: Joi.string()
      .description('the minimun block confirmation threshold after which we consider a transaction successful')
      .required(),
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
  creation_details_web_base_url: envVars.CREATION_DETAILS_WEB_BASE_URL,
  litigation: {
    jury_selection_algo_enabled: envVars.ENABLE_LITIGATION_JURY_SELECTION_ALGO,
    voting_days: envVars.LITIGATION_VOTING_DAYS,
    reconcilation_days: envVars.LITIGATION_RECONCILATION_DAYS,
    litigators: {
      jury_count: {
        min: envVars.MIN_LITIGATORS,
        max: envVars.MAX_LITIGATORS,
      },
      required_stars_for_jury: envVars.LITIGATION_JURY_REQUIRED_STARS,
    },
  },
  jwt: {
    secret: envVars.JWT_SECRET,
  },
  hashing_salt: {
    wallet_address: envVars.HASHING_SALT_WALLET_ADDRESS,
  },
  sendgrid: {
    api_key: envVars.SENDGRID_MAIL_API_KEY,
    from_name: envVars.SENDGRID_MAIL_FROM_NAME,
    from_email: envVars.SENDGRID_MAIL_FROM_EMAIL,
    invite_template_id: envVars.SENDGRID_MAIL_INVITE_TEMPLATE_ID,
  },
  web_client_base_url: envVars.WEB_CLIENT_BASE_URL,
  pinata: {
    jwt_secret: envVars.PINATA_JWT_SECRET,
    urls: {
      json_pin: envVars.PINATA_API_JSON_PIN_URL,
      unpin: envVars.PINATA_API_UNPIN_URL,
    },
  },
  crypto: {
    valid_transaction: {
      min_block_confirmations: envVars.MIN_BLOCK_CONFIRMATIONS_FOR_VALID_CRYPTO_TRANSACTION,
    },
  },
  blockfrost: {
    project_id: envVars.BLOCKFROST_PROJECT_ID,
    base_api_url: envVars.BLOCKFROST_API_BASE_URL,
    endpoints: {
      transactions: envVars.BLOCKFROST_API_TRANSACTIONS_ENDPOINT,
      blocks: envVars.BLOCKFROST_API_BLOCKS_ENDPOINT,
    },
    webhook_token: envVars.BLOCKFROST_WEBHOOK_AUTH_TOKEN,
  },
};
