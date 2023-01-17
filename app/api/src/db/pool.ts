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
      CREATE TYPE media_type_enums AS ENUM ('image', 'video', 'audio', 'pdf', 'document');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE recognition_status_enums AS ENUM ('pending', 'accepted', 'declined');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    DO $$ BEGIN
      CREATE TYPE litigation_status_enums AS ENUM ('pending', 'started', 'withdrawn');
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
      reputation_stars integer  DEFAULT 0,
      creation_count integer  DEFAULT 0,
      date_joined TIMESTAMP NOT NULL DEFAULT NOW(),
      is_invited bool default false
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

    CREATE TABLE IF NOT EXISTS recognition (
      recognition_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      recognition_by UUID NOT NULL,
      recognition_for UUID NOT NULL,
      recognition_description text,
      recognition_issued TIMESTAMP NOT NULL DEFAULT NOW(),
      status recognition_status_enums NOT NULL,
      status_updated TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      CONSTRAINT recognition_by
          FOREIGN KEY(recognition_by) 
          REFERENCES users(user_id)
          ON DELETE CASCADE,
      CONSTRAINT recognition_for
          FOREIGN KEY(recognition_for) 
          REFERENCES users(user_id)
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
      creation_date TIMESTAMP NOT NULL DEFAULT NOW(),
      is_draft bool default false,
      is_claimable bool default true,
      ipfs_hash character varying,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      is_onchain bool default false,
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
      litigation_start TIMESTAMP NOT NULL DEFAULT NOW(),
      litigation_end TIMESTAMP,
      litigation_status litigation_status_enums NOT NULL,
      ownership_transferred bool default false,
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
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
        is_invited
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
    `
  );
};

export { init, instance };
