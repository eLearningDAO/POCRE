interface IPkMap {
  maker_id: string;
  invite_from: string;
  invite_to: string;
  author_id: string;
  tags: string;
  materials: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  invitations: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  invite_id: string;
  status_id: string;
  source_id: string;
  type_id: string;
  user_id: string;
  decision_id: string;
  tag_id: string;
  litigation_id: string;
}

interface ITableNameMap {
  maker_id: string;
  invite_from: string;
  invite_to: string;
  author_id: string;
  tags: string;
  materials: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  invitations: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  invite_id: string;
  status_id: string;
  source_id: string;
  type_id: string;
  user_id: string;
  decision_id: string;
  tag_id: string;
  litigation_id: string;
}

/**
 * List of primary and foreign key names mapped to parent table primary key names
 */
const pkMap: IPkMap = {
  // decision table
  maker_id: 'user_id',
  // invitation table
  invite_from: 'user_id',
  invite_to: 'user_id',
  // material and creation table
  author_id: 'user_id',
  // creation table
  tags: 'tag_id',
  materials: 'material_id',
  // litigation table
  assumed_author: 'user_id',
  winner: 'user_id',
  issuer_id: 'user_id',
  invitations: 'invite_id',
  decisions: 'decision_id',
  // common
  creation_id: 'creation_id',
  material_id: 'material_id',
  invite_id: 'invite_id',
  status_id: 'status_id',
  source_id: 'source_id',
  type_id: 'type_id',
  user_id: 'user_id',
  decision_id: 'decision_id',
  tag_id: 'tag_id',
  litigation_id: 'litigation_id',
};

/**
 * List of primary key and foreign key names mapped to parent table name
 */
const tableNameMap: ITableNameMap = {
  // decision table
  maker_id: 'users',
  // invitation table
  invite_from: 'users',
  invite_to: 'users',
  // material and creation table
  author_id: 'users',
  // creation table
  tags: 'tag',
  materials: 'material',
  // litigation table
  assumed_author: 'users',
  winner: 'users',
  issuer_id: 'users',
  invitations: 'invitation',
  decisions: 'decision',
  // common
  creation_id: 'creation',
  material_id: 'material',
  invite_id: 'invitation',
  status_id: 'status',
  source_id: 'source',
  type_id: 'material_type',
  user_id: 'users',
  decision_id: 'decision',
  litigation_id: 'litigation',
  tag_id: 'tag',
};

/**
 * List of field names defined with array type in db tables
 */
const arrayFields: string[] = ['invitations', 'decisions', 'tags', 'materials'];

export type { IPkMap, ITableNameMap };

export { pkMap, tableNameMap, arrayFields };
