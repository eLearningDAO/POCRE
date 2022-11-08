import { API_BASE_URL } from 'config';
import errorMap from './errorMap';

const request = async (url = '', data = {}, method = '') => {
  const response = await fetch(url, {
    method,
    ...(method !== 'GET' && ({
      ...(method !== 'DELETE' && {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }),
    }))
    ,
  }).then((x) => x?.json());

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

const User = { ...(REQUEST_TEMPLATE('users')) };
const Source = { ...(REQUEST_TEMPLATE('source')) };
const MaterialType = { ...(REQUEST_TEMPLATE('material-type')) };
const Material = { ...(REQUEST_TEMPLATE('materials')) };
const Creation = { ...(REQUEST_TEMPLATE('creations')) };
const Decision = { ...(REQUEST_TEMPLATE('decision')) };
const Recognition = { ...(REQUEST_TEMPLATE('recognitions')) };
const Litigation = { ...(REQUEST_TEMPLATE('litigations')) };
const Status = { ...(REQUEST_TEMPLATE('status')) };
const Tag = { ...(REQUEST_TEMPLATE('tags')) };

export {
  User,
  Source,
  MaterialType,
  Material,
  Creation,
  Decision,
  Recognition,
  Litigation,
  Status,
  Tag,
};
