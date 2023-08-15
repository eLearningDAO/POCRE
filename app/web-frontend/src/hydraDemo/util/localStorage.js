/**
 * Makes a local storage util for saving/fetching a particular entity type.
 * Entities are stored in a simple key/value object by their ID.
 * This won't scale well, but that is not a concern for demo purposes.
 *
 * @param {Object} options - Config options.
 * @param {string} options.storageKey - Local storage key that items will be stored under.
 * @param {string} options.idField - Name of the ID field for the entities.
 */
export const makeLocalStorageManager = ({ storageKey, idField }) => {
  const errorPrefix = 'Could not make local storage manager: ';

  if (!storageKey) {
    throw new Error(`${errorPrefix} 'storageKey' is required`);
  }

  if (!idField) {
    throw new Error(`${errorPrefix} 'idField' is required`);
  }

  const replaceAll = (entities) => {
    window.localStorage.setItem(storageKey, JSON.stringify(entities));
  };

  const fetchAll = ({ asList = false } = {}) => {
    try {
      const rawEntities = window.localStorage.getItem(storageKey);
      const parsedEntities = rawEntities ? JSON.parse(rawEntities) : {};

      return asList ? Object.values(parsedEntities) : parsedEntities;
    } catch (error) {
      throw new Error(`Error fetching from local storage key '${storageKey}'`, error);
    }
  };

  const save = (entity) => {
    const id = entity[idField];

    if (!id) {
      throw new Error('Could not save entity: ID is missing', entity);
    }

    try {
      const entities = fetchAll();

      entities[id] = entity;
      replaceAll(entities);

      return entities;
    } catch (error) {
      throw new Error(`Error saving to local storage key '${storageKey}'`, error);
    }
  };

  const getById = (id) => fetchAll()[id];

  const deleteById = (id) => {
    const entities = fetchAll();
    delete entities[id];

    replaceAll(entities);
  };

  return {
    fetchAll,
    save,
    getById,
    deleteById,
  };
};
