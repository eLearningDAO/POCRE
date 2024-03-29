import { API_BASE_URL } from 'config';
import authUser from 'utils/helpers/authUser';
import errorMap from './errorMap';

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
const Notifications = REQUEST_TEMPLATE('notifications');
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
