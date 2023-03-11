interface IPkMap {
  maker_id: string;
  recognition_by: string;
  recognition_for: string;
  author_id: string;
  tags: string;
  materials: string;
  transactions: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  recognitions: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  recognition_id: string;
  user_id: string;
  decision_id: string;
  tag_id: string;
  litigation_id: string;
  transaction_id: string;
}

interface ITableNameMap {
  maker_id: string;
  recognition_by: string;
  recognition_for: string;
  author_id: string;
  tags: string;
  materials: string;
  transactions: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  recognitions: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  recognition_id: string;
  user_id: string;
  decision_id: string;
  tag_id: string;
  litigation_id: string;
  transaction_id: string;
}

/**
 * List of primary and foreign key names mapped to parent table primary key names
 */
const pkMap: IPkMap = {
  // decision and transaction table
  maker_id: 'user_id',
  // recognition table
  recognition_by: 'user_id',
  recognition_for: 'user_id',
  // material and creation table
  author_id: 'user_id',
  // creation table
  tags: 'tag_id',
  materials: 'material_id',
  transactions: 'transaction_id',
  // litigation table
  assumed_author: 'user_id',
  winner: 'user_id',
  issuer_id: 'user_id',
  recognitions: 'recognition_id',
  decisions: 'decision_id',
  // common
  creation_id: 'creation_id',
  material_id: 'material_id',
  recognition_id: 'recognition_id',
  user_id: 'user_id',
  decision_id: 'decision_id',
  tag_id: 'tag_id',
  litigation_id: 'litigation_id',
  transaction_id: 'transaction_id',
};

/**
 * List of primary key and foreign key names mapped to parent table name
 */
const tableNameMap: ITableNameMap = {
  // decision table
  maker_id: 'VIEW_users_public_fields',
  // recognition table
  recognition_by: 'VIEW_users_public_fields',
  recognition_for: 'VIEW_users_public_fields',
  // material and creation table
  author_id: 'VIEW_users_public_fields',
  // creation table
  tags: 'tag',
  materials: 'material',
  transactions: 'transaction',
  // litigation table
  assumed_author: 'VIEW_users_public_fields',
  winner: 'VIEW_users_public_fields',
  issuer_id: 'VIEW_users_public_fields',
  recognitions: 'recognition',
  decisions: 'decision',
  // common
  creation_id: 'creation',
  material_id: 'material',
  recognition_id: 'recognition',
  user_id: 'VIEW_users_public_fields',
  decision_id: 'decision',
  litigation_id: 'litigation',
  tag_id: 'tag',
  transaction_id: 'transaction',
};

/**
 * List of field names defined with array type in db tables
 */
const arrayFields: string[] = ['recognitions', 'decisions', 'tags', 'materials', 'transactions'];

/**
 * List of deep fields that can be populated in decision
 */
const decisionDeepFields: string[] = ['maker_id'];

/**
 * List of deep fields that can be populated in transaction
 */
const transactionDeepFields: string[] = ['maker_id'];

/**
 * List of deep fields that can be populated in recognition
 */
const recognitionDeepFields: string[] = ['recognition_by', 'recognition_for'];

/**
 * List of deep fields that can be populated in material
 */
const materialDeepFields: string[] = [
  'recognition_id',
  ...recognitionDeepFields.map((x) => `recognition_id.${x}`),
  'author_id',
];

/**
 * List of deep fields that can be populated in creation
 */
const creationDeepFields: string[] = [
  'author_id',
  'tags',
  'materials',
  ...materialDeepFields.map((x) => `materials.${x}`),
  'transactions',
  ...transactionDeepFields.map((x) => `transactions.${x}`),
];

/**
 * List of deep fields that can be populated in litigation
 */
const litigationDeepFields: string[] = [
  'assumed_author',
  'issuer_id',
  'winner',
  'creation_id',
  ...creationDeepFields.map((x) => `creation_id.${x}`),
  'material_id',
  ...materialDeepFields.map((x) => `material_id.${x}`),
  'recognitions',
  ...recognitionDeepFields.map((x) => `recognitions.${x}`),
  'decisions',
  ...decisionDeepFields.map((x) => `decisions.${x}`),
];

export type { IPkMap, ITableNameMap };

export {
  pkMap,
  tableNameMap,
  arrayFields,
  decisionDeepFields,
  transactionDeepFields,
  recognitionDeepFields,
  materialDeepFields,
  creationDeepFields,
  litigationDeepFields,
};
