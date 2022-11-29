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
  }).then((x) => (method !== 'DELETE' ? x?.json() : x));

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

const User = REQUEST_TEMPLATE('users');
const Material = REQUEST_TEMPLATE('materials');
const Creation = REQUEST_TEMPLATE('creations');
const Decision = REQUEST_TEMPLATE('decision');
const Recognition = REQUEST_TEMPLATE('recognitions');
const Litigation = REQUEST_TEMPLATE('litigations');
const Tag = REQUEST_TEMPLATE('tags');
const Auth = { login: REQUEST_TEMPLATE('auth/login').create };

export {
  User,
  Material,
  Creation,
  Decision,
  Recognition,
  Litigation,
  Tag,
  Auth,
};
