import { API_BASE_URL } from 'config';
import authUser from 'utils/helpers/authUser';
import { makeLocalStorageManager } from 'hydraDemo/util/localStorage';
import errorMap from './errorMap';

const localData = {
  litigations: makeLocalStorageManager({ storageKey: 'litigations', idField: 'litigation_id' }),
  creations: makeLocalStorageManager({ storageKey: 'creations', idField: 'creation_id' }),
  notifications: makeLocalStorageManager({ storageKey: 'notifications', idField: 'notification_id' }),
};

const mockGetAllResponse = async (results) => ({
  results,
  limit: 1000,
  page: 0,
  total_results: results.length.toString(),
  total_pages: results.length > 0 ? 1 : 0,
});

const request = async (url = '', data = {}, method = '') => {
  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${authUser.getJWTToken()}`, // send in all requests
      ...(['POST', 'PATCH'].includes(method) && {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      }),
    },
    ...(['POST', 'PATCH'].includes(method) && {
      body: JSON.stringify(data),
    }),
  }).then((x) => {
    if (method === 'DELETE' && x.ok) return x;
    return x?.json();
  });

  if (response?.code >= 400) {
    throw new Error(errorMap[response?.message?.toLowerCase()] || response?.message);
  }

  return response;
};

const REQUEST_TEMPLATE = (endpoint) => ({
  create: async (requestBody) => await request(`${API_BASE_URL}/${endpoint}`, requestBody, 'POST'),
  update: async (id, requestBody) => await request(`${API_BASE_URL}/${endpoint}/${id}`, requestBody, 'PATCH'),
  delete: async (id) => await request(`${API_BASE_URL}/${endpoint}/${id}`, {}, 'DELETE'),
  getAll: async (queryParameters) => await request(`${API_BASE_URL}/${endpoint}?${queryParameters}`, {}, 'GET'),
  getById: async (id, queryParameters = '') => await request(`${API_BASE_URL}/${endpoint}/${id}?${queryParameters}`, {}, 'GET'),
});

const LOCAL_STORAGE_REQUEST_TEMPLATE = (endpoint) => ({
  create: async (entity) => localData[endpoint].save(entity),
  update: async (_, entity) => localData[endpoint].save(entity),
  delete: async (id) => localData[endpoint].deleteById(id),
  getAll: async () => {
    const entities = localData[endpoint].fetchAll({ asList: true });
    return mockGetAllResponse(entities);
  },
  getById: async (id) => localData[endpoint].getById(id),
});

const User = {
  ...REQUEST_TEMPLATE('users'), invite: REQUEST_TEMPLATE('users/invite').create, verifyEmail: REQUEST_TEMPLATE('users/verifyUserEmail').create, confirmEmail: REQUEST_TEMPLATE('users/verifyUserEmail').getById,
};
const Material = REQUEST_TEMPLATE('materials');
const Notifications = {
  ...LOCAL_STORAGE_REQUEST_TEMPLATE('notifications'),
};
const Creation = {
  ...LOCAL_STORAGE_REQUEST_TEMPLATE('creations'),
  getAll: async (queryParameters) => {
    const allCreations = localData.creations.fetchAll({ asList: true });

    const parameters = new URLSearchParams(queryParameters);
    const query = parameters.get('query');
    const searchFields = parameters.get('search_fields[]');

    // Overridden for handling suggestion searches when creating litigations
    if (searchFields === 'creation_title') {
      const matchingCreations = allCreations.filter(
        (x) => x.creation_title.toLowerCase().includes(query.toLowerCase()),
      );

      return mockGetAllResponse(matchingCreations);
    }

    return mockGetAllResponse(allCreations);
  },
  create: async (creation) => {
    // TODO: Handle other media types
    const creationType = creation.creation_link.includes('youtube') ? 'youtube_video' : 'image';
    return LOCAL_STORAGE_REQUEST_TEMPLATE('creations').create({ ...creation, creation_type: creationType, is_claimable: true });
  },
  registerTransaction: async (id, requestBody) => await REQUEST_TEMPLATE(`creations/${id}/transaction`).create(requestBody),
};
const Decision = REQUEST_TEMPLATE('decision');
const Recognition = { ...REQUEST_TEMPLATE('recognitions'), respond: async (id, requestBody) => await REQUEST_TEMPLATE(`recognitions/${id}/respond`).create(requestBody) };
const Litigation = {
  ...LOCAL_STORAGE_REQUEST_TEMPLATE('litigations'),
  respond: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/respond`).create(requestBody),
  vote: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/vote`).create(requestBody),
  claimOwnership: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/claim-ownership`).create(requestBody),
  getAll: async (queryParameters) => {
    const litigations = localData.litigations.fetchAll({ asList: true });

    // Move handling of query params into local storage manager so this can be generalized
    if (queryParameters?.includes('judged_by')) {
      const user = authUser.getUser();
      const litigationsToJudge = litigations.filter(
        (litigation) => litigation.recognitions.some(
          (x) => x.recognition_for.user_id === user.user_id,
        ),
      );
      return mockGetAllResponse(litigationsToJudge);
    }

    return mockGetAllResponse(litigations);
  },
};
const Tag = REQUEST_TEMPLATE('tags');
const Auth = { login: REQUEST_TEMPLATE('auth/login').create, signup: REQUEST_TEMPLATE('auth/signup').create };
const Files = { getMediaType: REQUEST_TEMPLATE('files/media-type').getAll };
const Transaction = { create: REQUEST_TEMPLATE('transactions').create };

export {
  User,
  Material,
  Notifications,
  Creation,
  Decision,
  Recognition,
  Litigation,
  Tag,
  Auth,
  Files,
  Transaction,
};
