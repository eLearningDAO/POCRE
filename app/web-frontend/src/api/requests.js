import { v4 as uuidv4 } from 'uuid';
import { API_BASE_URL } from 'config';
import authUser from 'utils/helpers/authUser';
import { makeLocalStorageManager } from 'hydraDemo/util/localStorage';
import errorMap from './errorMap';

const idField = 'litigation_id';
const storageManager = makeLocalStorageManager({ storageKey: 'litigations', idField });

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

const User = {
  ...REQUEST_TEMPLATE('users'), invite: REQUEST_TEMPLATE('users/invite').create, verifyEmail: REQUEST_TEMPLATE('users/verifyUserEmail').create, confirmEmail: REQUEST_TEMPLATE('users/verifyUserEmail').getById,
};
const Material = REQUEST_TEMPLATE('materials');
const Notifications = {
  ...REQUEST_TEMPLATE('notifications'),

  // Overrides for hydra demo (requests were failing)
  getAll: async () => mockGetAllResponse([]),
};
const Creation = {
  ...REQUEST_TEMPLATE('creations'),
  registerTransaction: async (id, requestBody) => await REQUEST_TEMPLATE(`creations/${id}/transaction`).create(requestBody),
};
const Decision = REQUEST_TEMPLATE('decision');
const Recognition = { ...REQUEST_TEMPLATE('recognitions'), respond: async (id, requestBody) => await REQUEST_TEMPLATE(`recognitions/${id}/respond`).create(requestBody) };
const Litigation = {
  ...REQUEST_TEMPLATE('litigations'),
  respond: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/respond`).create(requestBody),
  vote: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/vote`).create(requestBody),
  claimOwnership: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/claim-ownership`).create(requestBody),

  // Overrides for hydra demo
  getAll: async (queryParameters) => {
    const litigations = storageManager.fetchAll({ asList: true });
    console.log('fetched litigations', litigations);

    if (queryParameters?.includes('judged_by')) {
      const user = authUser.getUser();
      const litigationsToJudge = litigations.filter((x) => x.recognitions.includes(user.user_id));
      return mockGetAllResponse(litigationsToJudge);
    }

    return mockGetAllResponse(litigations);
  },
  getById: async (id) => storageManager.getById(id),
  update: async (id, litigation) => storageManager.save(litigation),
  create: async (litigation) => {
    storageManager.save({ ...litigation, litigation_id: uuidv4() });
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
