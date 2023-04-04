import { Pool, QueryResult } from 'pg';
import config from '../config/config';
import logger from '../config/logger';

const pool = new Pool({
  database: config.database.name,
  user: config.database.username,
  password: config.database.password,
  host: config.database.host,
  port: config.database.port,
  ...(config.env === 'development' && { log: (msg) => logger.info(`DB: ${msg}`) }),
});

const instance = pool;

const init = async (): Promise<QueryResult<any>> => {
  await pool.connect();

  return pool.query(
    `
    /* ************************************ */
    /* ENUMS */
    /* ************************************ */

    DO $$ BEGIN
      CREATE TYPE media_type_enums AS ENUM ('image', 'video', 'audio', 'pdf', 'document','youtube_video');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE recognition_status_enums AS ENUM ('pending', 'accepted', 'declined');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE notification_status_enums AS ENUM ('read', 'unread');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE assumed_author_response_enums AS ENUM ('pending_response', 'start_litigation', 'withdraw_claim');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE transaction_purpose_enums AS ENUM ('publish_creation', 'finalize_creation', 'start_litigation', 'cast_litigation_vote', 'redeem_litigated_item', 'accept_recognition');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    /* ************************************ */
    /* TABLES */
    /* ************************************ */

    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_name character varying NOT NULL,
      wallet_address character varying UNIQUE,
      user_bio text,
      image_url character varying,
      email_address character varying,
      phone character varying,
      verified_id character varying,
      reputation_stars integer NOT NULL DEFAULT 0,
      creation_count integer NOT NULL DEFAULT 0,
      email_verified bool DEFAULT false,
      otp_code text,
      date_joined TIMESTAMP NOT NULL DEFAULT NOW(),
      is_invited bool default false,
      is_default_judge bool default false
    );

    CREATE TABLE IF NOT EXISTS decision (
      decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      decision_status bool default false,
      maker_id UUID NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT maker_id
          FOREIGN KEY(maker_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS transaction (
      transaction_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      transaction_hash character varying NOT NULL UNIQUE,
      transaction_purpose transaction_purpose_enums NOT NULL,
      is_validated bool DEFAULT false,
      maker_id UUID NOT NULL,
      blocking_issue character varying,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT maker_id
          FOREIGN KEY(maker_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS notification (
      notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      notification_for UUID NOT NULL,
      notification_title text,
      notification_description text,
      notification_link text,
      creation_link text,
      creation_type media_type_enums NOT NULL,
      notification_issued TIMESTAMP NOT NULL DEFAULT NOW(),
      status notification_status_enums NOT NULL,
      status_updated TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT notification_for
          FOREIGN KEY(notification_for) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recognition (
      recognition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recognition_by UUID NOT NULL,
      recognition_for UUID NOT NULL,
      recognition_description text,
      recognition_issued TIMESTAMP NOT NULL DEFAULT NOW(),
      status recognition_status_enums NOT NULL,
      status_updated TIMESTAMP NOT NULL DEFAULT NOW(),
      transaction_id UUID UNIQUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT recognition_by
          FOREIGN KEY(recognition_by) 
          REFERENCES users(user_id)
          ON DELETE CASCADE,
      CONSTRAINT recognition_for
          FOREIGN KEY(recognition_for) 
          REFERENCES users(user_id)
          ON DELETE CASCADE,
      CONSTRAINT transaction_id
          FOREIGN KEY(transaction_id) 
          REFERENCES transaction(transaction_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tag (
      tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tag_name character varying UNIQUE NOT NULL,
      tag_description text,
      tag_created TIMESTAMP NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS material (
      material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_title character varying NOT NULL,
      material_description text,
      material_link character varying NOT NULL,
      material_type media_type_enums NOT NULL,
      recognition_id UUID UNIQUE,
      author_id UUID NOT NULL,
      is_claimable bool default true,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT recognition_id
          FOREIGN KEY(recognition_id) 
          REFERENCES recognition(recognition_id),
      CONSTRAINT author_id
          FOREIGN KEY(author_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS creation (
      creation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creation_title character varying NOT NULL,
      creation_description text,
      creation_link character varying NOT NULL,
      creation_type media_type_enums NOT NULL,
      author_id UUID NOT NULL,
      tags UUID[],
      materials UUID[],
      transactions UUID[],
      creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_draft bool default true,
      ipfs_hash character varying,
      is_claimable bool default true,
      creation_authorship_window TIMESTAMP NOT NULL DEFAULT NOW(),
      is_fully_owned bool default false,
      CONSTRAINT author_id
          FOREIGN KEY(author_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS litigation (
      litigation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      litigation_title character varying NOT NULL,
      litigation_description text,
      creation_id UUID NOT NULL,
      material_id UUID UNIQUE,
      assumed_author UUID NOT NULL,
      issuer_id UUID NOT NULL,
      winner UUID NOT NULL,
      recognitions UUID[],
      decisions UUID[],
      transactions UUID[],
      reconcilation_start TIMESTAMP NOT NULL,
      reconcilation_end TIMESTAMP NOT NULL,
      voting_start TIMESTAMP NOT NULL,
      voting_end TIMESTAMP NOT NULL,
      assumed_author_response assumed_author_response_enums NOT NULL,
      ownership_transferred bool default false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_draft bool default false,
      CONSTRAINT material_id
          FOREIGN KEY(material_id) 
          REFERENCES material(material_id)
          ON DELETE CASCADE,
      CONSTRAINT issuer_id
          FOREIGN KEY(issuer_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    /* ************************************ */
    /* VIEWS */
    /* [NOTE]: Used by app to remove sensitive fields from api response */
    /* ************************************ */
    CREATE OR REPLACE VIEW 
      VIEW_users_public_fields 
    AS 
      SELECT 
        user_id,
        user_name,
        user_bio,
        image_url,
        reputation_stars,
        date_joined,
        is_invited,
        email_verified
    FROM 
    users;

    /* ************************************ */
    /* PRODECURES */
    /* ************************************ */

    CREATE OR REPLACE PROCEDURE remove_tag_references(tag_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE creation SET tags = array_remove(tags, tag_id);
    $$;

    CREATE OR REPLACE PROCEDURE remove_material_references(material_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE creation SET materials = array_remove(materials, material_id);
    $$;

    CREATE OR REPLACE PROCEDURE remove_recognition_references(recognition_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE litigation SET recognitions = array_remove(recognitions, recognition_id);
    $$;

    CREATE OR REPLACE PROCEDURE remove_decision_references(decision_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE litigation SET decisions = array_remove(decisions, decision_id);
    $$;

    CREATE OR REPLACE PROCEDURE remove_transaction_references(transaction_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE creation SET transactions = array_remove(transactions, transaction_id);
      UPDATE litigation SET transactions = array_remove(transactions, transaction_id);
    $$;
    `
  );
};

export { init, instance };
