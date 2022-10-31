import { IPkMap, pkMap, ITableNameMap, tableNameMap, arrayFields } from '../map';

interface IPopulator {
  tableAlias: string;
  fields: string[];
}

interface IDeepPopulate {
  fieldName: string;
  withPopulated?: (IDeepPopulate | string)[];
}

interface IDeepFieldPopulator extends IDeepPopulate {
  selectAs: string;
  tableAlias: string;
}

/**
 * Populates the data of a forign key field from the foreign key reference table with recursion
 * @param tableAlias - alias of table referenced by foreign key
 * @param selectAs - name of the column returned that contains selected data
 * @param fieldName - the original field name of foreign key
 * @param withPopulated - fields to deep populate by fieldName and withPopulated fields
 * @returns query string calculated by parameters
 */
const deepFieldPopulator = ({ tableAlias, selectAs, fieldName, withPopulated }: IDeepFieldPopulator): string => {
  // calculated fields
  const selectAsArray = arrayFields.includes(fieldName);
  const fromTable = tableNameMap[fieldName as keyof ITableNameMap];
  const withPrimaryKey = pkMap[fieldName as keyof IPkMap];
  const alias = `${fromTable}_${selectAs}_${Math.floor(Math.random() * (100000 - 1 + 1) + 100000)}`;
  const equalsForeignKey = `${tableAlias}.${fieldName}`;

  // base case
  if (!withPopulated) {
    return selectAsArray
      ? `(SELECT json_agg(${alias}.*) as ${selectAs} FROM ${fromTable} ${alias} WHERE ${withPrimaryKey} = ANY(${equalsForeignKey})) as ${selectAs}`
      : `(SELECT row_to_json(${alias}.*) as ${selectAs} FROM ${fromTable} ${alias} WHERE ${withPrimaryKey} = ${equalsForeignKey} LIMIT 1) as ${selectAs}`;
  }

  // second level recurse
  const rescursivelyPopulated = withPopulated
    .map((x) =>
      deepFieldPopulator({
        tableAlias: alias,
        ...(typeof x === 'string'
          ? {
              fieldName: x,
              selectAs: x,
            }
          : {
              fieldName: x.fieldName,
              selectAs: x.fieldName,
              withPopulated: x.withPopulated,
            }),
      })
    )
    .join(',');

  // first level conditions
  const conditions = `${fromTable} ${alias} WHERE ${withPrimaryKey} = ${
    selectAsArray ? `ANY(${equalsForeignKey})` : equalsForeignKey
  }`;

  // first level recurse
  return selectAsArray
    ? `(SELECT json_agg(${alias}.*) as ${selectAs} FROM 
          (SELECT *, ${rescursivelyPopulated} FROM ${conditions}) 
          as ${alias}
        ) as ${selectAs}`
    : `(SELECT row_to_json(${alias}.*) as ${selectAs} FROM
          (SELECT *, ${rescursivelyPopulated} FROM ${conditions}) 
          as ${alias}
        ) as ${selectAs}`;
};

function makeHierarchyTree(obj: any) {
  const result: any = {};

  // For each object path (property key) in the object
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const objectPath in obj) {
    // Split path into component parts
    const parts = objectPath.split('.');

    // Create sub-objects along path as needed
    let target = result;
    while (parts.length > 1) {
      const part = parts.shift();
      // eslint-disable-next-line no-multi-assign
      target = target[part as string] = target[part as string] || {};
    }

    // Set value at end of path
    target[parts[0]] = obj[objectPath];
  }

  return result;
}

const transformObjectToPopulator = (obj: any = {}): any => {
  return Object.keys(obj).map((x) => ({
    fieldName: x,
    selectAs: x,
    ...(Object.keys(obj[x]).length > 0 && {
      withPopulated: Object.keys(obj[x]).map((y) =>
        Object.values(obj[x][y]).length > 0 ? transformObjectToPopulator({ [y]: obj[x][y] })[0] : y
      ),
    }),
  }));
};

const fieldPopulateObjectsGenerator = (fields: string[]) => {
  const sortedFields = [...fields].sort((a, b) => a.length - b.length);

  const fieldsToObject: any = {};
  sortedFields.map((x) => {
    fieldsToObject[x as any] = {};
    return null;
  });

  const objectTree = makeHierarchyTree(fieldsToObject);

  const populatorObjects = Object.keys(objectTree).map((x) => transformObjectToPopulator({ [x]: objectTree[x] })[0]);

  return populatorObjects;
};

/**
 * Populates the data of forign key fields from the foreign key reference tables
 * @param tableAlias - the alias of query table
 * @param fields - names of foreign key fields to populate
 * @returns query string with population queries calculated by parameters
 */
const populator = ({ tableAlias, fields }: IPopulator): string => {
  if (fields.length === 0) return '';

  const fieldsPopulateObjects = fieldPopulateObjectsGenerator(fields);

  return `,${fieldsPopulateObjects
    .map((populateObject) => {
      return `${deepFieldPopulator({
        tableAlias,
        ...populateObject,
      })}`;
    })
    .join(',')}`;
};

export { populator, deepFieldPopulator };
