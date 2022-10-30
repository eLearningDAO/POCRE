import { IPkMap, pkMap, ITableNameMap, tableNameMap, arrayFields } from '../map';

interface IPopulateField {
  havingOriginalFieldName: string;
  fromTable: string;
  withPrimaryKey: string;
  equalsForeignKey: string;
  as: string;
}

interface IPopulator {
  tableAlias: string;
  fields: (string | string[])[] | undefined;
}

/**
 * Populates the data of a forign key field from the foreign key reference table
 * @param havingOriginalFieldName - the original field name of foreign key
 * @param fromTable - name of table referenced by foreign key
 * @param withPrimaryKey - name of primary key of table referenced by foreign key
 * @param equalsForeignKey - name of foreign key
 * @param as - name of the column returned that contains selected data
 * @returns query string calculated by parameters
 */
const populateField = ({
  havingOriginalFieldName,
  fromTable,
  withPrimaryKey,
  equalsForeignKey,
  as,
}: IPopulateField): string => {
  const alias = `${fromTable}_${as}_${Math.floor(Math.random() * (1000 - 1 + 1) + 1000)}`;

  return arrayFields.includes(havingOriginalFieldName)
    ? `(SELECT json_agg(${alias}.*) as ${as} FROM ${fromTable} ${alias} WHERE ${withPrimaryKey} = ANY(${equalsForeignKey})) as ${as}`
    : `(SELECT row_to_json(${alias}.*) as ${as} FROM ${fromTable} ${alias} WHERE ${withPrimaryKey} = ${equalsForeignKey} LIMIT 1) as ${as}`;
};

/**
 * Populates the data of forign key fields from the foreign key reference tables
 * @param tableAlias - the alias of query table
 * @param fields - names of foreign key fields to populate
 * @returns query string with population queries calculated by parameters
 */
const populator = ({ tableAlias, fields }: IPopulator): string => {
  return fields && fields.length > 0
    ? `,${fields
        .map((field) => {
          const originalFieldName = typeof field === 'string' ? field : field[0];
          const renamedFieldName = typeof field === 'string' ? field : field[1];

          return `${populateField({
            havingOriginalFieldName: originalFieldName,
            fromTable: tableNameMap[originalFieldName as keyof ITableNameMap],
            withPrimaryKey: pkMap[originalFieldName as keyof IPkMap],
            equalsForeignKey: `${tableAlias}.${originalFieldName}`,
            as: renamedFieldName,
          })}`;
        })
        .join(',')}`
    : '';
};

export { populator, populateField };
