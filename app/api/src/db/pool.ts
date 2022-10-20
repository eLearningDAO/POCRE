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

const query = async (text: string, params: Array<any>): Promise<QueryResult<any>> => {
  return pool.query(text, params);
};

const instance = pool;

const init = async (): Promise<QueryResult<any>> => {
  await pool.connect();

  return pool.query(
    `
    CREATE TABLE IF NOT EXISTS users (
      user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_name character varying NOT NULL UNIQUE,
      wallet_address character varying,
      user_bio text,
      image_url character varying,
      email_address character varying,
      phone character varying,
      verified_Id character varying,
      date_joined DATE NOT NULL DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS status (
      status_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      status_name character varying NOT NULL,
      status_description text,
      action_made DATE NOT NULL DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS decision (
      decision_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      decision_status bool default false,
      maker_id UUID NOT NULL,
      CONSTRAINT maker_id
          FOREIGN KEY(maker_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS invitation (
      invite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      invite_from UUID NOT NULL,
      invite_to UUID NOT NULL,
      invite_description text,
      invite_issued DATE NOT NULL DEFAULT CURRENT_DATE,
      status_id UUID UNIQUE NOT NULL,
      CONSTRAINT invite_from
          FOREIGN KEY(invite_from) 
          REFERENCES users(user_id)
          ON DELETE CASCADE,
      CONSTRAINT invite_to
          FOREIGN KEY(invite_to) 
          REFERENCES users(user_id)
          ON DELETE CASCADE,
      CONSTRAINT status_id
          FOREIGN KEY(status_id) 
          REFERENCES status(status_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS source (
      source_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      source_title character varying NOT NULL,
      source_description text,
      site_url character varying
    );

    CREATE TABLE IF NOT EXISTS tag (
      tag_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tag_name character varying NOT NULL,
      tag_description text,
      tag_created DATE NOT NULL DEFAULT CURRENT_DATE
    );

    CREATE TABLE IF NOT EXISTS material_type (
      type_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      type_name character varying NOT NULL,
      type_description text
    );

    CREATE TABLE IF NOT EXISTS material (
      material_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      material_title character varying NOT NULL,
      material_description text,
      material_link character varying,
      source_id UUID UNIQUE NOT NULL,
      type_id UUID UNIQUE NOT NULL,
      invite_id UUID UNIQUE,
      author_id UUID NOT NULL,
      is_claimable bool default true,
      CONSTRAINT source_id
          FOREIGN KEY(source_id) 
          REFERENCES source(source_id)
          ON DELETE CASCADE,
      CONSTRAINT type_id
          FOREIGN KEY(type_id) 
          REFERENCES material_type(type_id)
          ON DELETE CASCADE,
      CONSTRAINT invite_id
          FOREIGN KEY(invite_id) 
          REFERENCES invitation(invite_id),
      CONSTRAINT author_id
          FOREIGN KEY(author_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS creation (
      creation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      creation_title character varying NOT NULL,
      creation_description text,
      source_id UUID UNIQUE NOT NULL,
      author_id UUID NOT NULL,
      tags UUID[],
      materials UUID[],
      creation_date DATE NOT NULL DEFAULT CURRENT_DATE,
      is_draft bool default false,
      is_claimable bool default true,
      CONSTRAINT source_id
          FOREIGN KEY(source_id) 
          REFERENCES source(source_id)
          ON DELETE CASCADE,
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
      invitations UUID[],
      decisions UUID[],
      litigation_start DATE NOT NULL DEFAULT CURRENT_DATE,
      litigation_end DATE,
      reconcilate bool default false,
      ownership_transferred bool default false,
      CONSTRAINT material_id
          FOREIGN KEY(material_id) 
          REFERENCES material(material_id)
          ON DELETE CASCADE,
      CONSTRAINT issuer_id
          FOREIGN KEY(issuer_id) 
          REFERENCES users(user_id)
          ON DELETE CASCADE
    );

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

    CREATE OR REPLACE PROCEDURE remove_invitation_references(invite_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE litigation SET invitations = array_remove(invitations, invite_id);
    $$;

    CREATE OR REPLACE PROCEDURE remove_decision_references(decision_id UUID)
    LANGUAGE SQL
    AS $$
      UPDATE litigation SET decisions = array_remove(decisions, decision_id);
    $$;
    `
  );
};

export { query, init, instance };
