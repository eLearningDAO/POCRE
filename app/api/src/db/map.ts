interface IPkMap {
  maker_id: string;
  recognition_by: string;
  recognition_for: string;
  author_id: string;
  tags: string;
  materials: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  recognitions: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  recognition_id: string;
  status_id: string;
  type_id: string;
  user_id: string;
  decision_id: string;
  tag_id: string;
  litigation_id: string;
}

interface ITableNameMap {
  maker_id: string;
  recognition_by: string;
  recognition_for: string;
  author_id: string;
  tags: string;
  materials: string;
  assumed_author: string;
  winner: string;
  issuer_id: string;
  recognitions: string;
  decisions: string;
  creation_id: string;
  material_id: string;
  recognition_id: string;
  status_id: string;
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
  // recognition table
  recognition_by: 'user_id',
  recognition_for: 'user_id',
  // material and creation table
  author_id: 'user_id',
  // creation table
  tags: 'tag_id',
  materials: 'material_id',
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
  status_id: 'status_id',
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
  // recognition table
  recognition_by: 'users',
  recognition_for: 'users',
  // material and creation table
  author_id: 'users',
  // creation table
  tags: 'tag',
  materials: 'material',
  // litigation table
  assumed_author: 'users',
  winner: 'users',
  issuer_id: 'users',
  recognitions: 'recognition',
  decisions: 'decision',
  // common
  creation_id: 'creation',
  material_id: 'material',
  recognition_id: 'recognition',
  status_id: 'status',
  type_id: 'material_type',
  user_id: 'users',
  decision_id: 'decision',
  litigation_id: 'litigation',
  tag_id: 'tag',
};

/**
 * List of field names defined with array type in db tables
 */
const arrayFields: string[] = ['recognitions', 'decisions', 'tags', 'materials'];

/**
 * List of deep fields that can be populated in decision
 */
const decisionDeepFields: string[] = ['maker_id'];

/**
 * List of deep fields that can be populated in recognition
 */
const recognitionDeepFields: string[] = ['recognition_by', 'recognition_for', 'status_id'];

/**
 * List of deep fields that can be populated in material
 */
const materialDeepFields: string[] = [
  'type_id',
  'recognition_id',
  ...recognitionDeepFields.map((x) => `recognition_id.${x}`),
  'author_id',
];

/**
 * List of deep fields that can be populated in creation
 */
const creationDeepFields: string[] = ['author_id', 'tags', 'materials', ...materialDeepFields.map((x) => `materials.${x}`)];

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
  recognitionDeepFields,
  materialDeepFields,
  creationDeepFields,
  litigationDeepFields,
};
