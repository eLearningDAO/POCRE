import { v4 as uuidv4 } from 'uuid';

export const makeRepo = ({ storageKey, idField }) => {
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
    const id = entity[idField] ?? uuidv4();
    const newEntity = { ...entity, [idField]: id };

    try {
      const entities = fetchAll();

      entities[id] = newEntity;
      replaceAll(entities);

      return newEntity;
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

const makeUsersRepo = () => {
  const usersRepo = makeRepo({ storageKey: 'users', idField: 'user_id' });
  const getByWalletAddress = (walletAddress) => {
    const allUsers = usersRepo.fetchAll({ asList: true });
    return allUsers.find((x) => x.walletAddress === walletAddress);
  };

  return {
    ...usersRepo,
    getByWalletAddress,
  };
};

/**
 * Local storage repositories (used to bypass backend for hydra demo purposes)
 */
export default {
  litigations: makeRepo({ storageKey: 'litigations', idField: 'litigation_id' }),
  creations: makeRepo({ storageKey: 'creations', idField: 'creation_id' }),
  notifications: makeRepo({ storageKey: 'notifications', idField: 'notification_id' }),
  users: makeUsersRepo(),
};
