import { API_BASE_URL } from 'config';
import authUser from 'utils/helpers/authUser';
import statusTypes from 'utils/constants/statusTypes';
import localData from 'hydraDemo/util/localData';
import errorMap from './errorMap';

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

const LOCAL_DATA_REQUEST_TEMPLATE = (endpoint) => ({
  create: async (entity) => localData[endpoint].save(entity),
  update: async (id, updatedFields) => {
    const existingEntity = localData[endpoint].getById(id) ?? {};
    const newEntity = { ...existingEntity, ...updatedFields };
    return localData[endpoint].save(newEntity);
  },
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
const Material = {
  ...LOCAL_DATA_REQUEST_TEMPLATE('materials'),
  create: async (material) => localData.materials.save({ ...material, is_claimable: true }),
};
const Notifications = LOCAL_DATA_REQUEST_TEMPLATE('notifications');
const Creation = {
  ...LOCAL_DATA_REQUEST_TEMPLATE('creations'),
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
    const user = authUser.getUser();

    return LOCAL_DATA_REQUEST_TEMPLATE('creations').create({
      ...creation,
      author_id: user.user_id,
      author: user,
      creation_type: creationType,
      is_claimable: true,
      is_draft: true,
    });
  },
  getById: async (id, queryParameters) => {
    const creation = localData.creations.getById(id);

    if (queryParameters?.includes('materials')) {
      const expandedMaterials = creation.materials?.map(
        (materialId) => {
          const material = localData.materials.getById(materialId);
          const author = localData.users.getById(material.author_id);
          return { ...material, author };
        },
      ) ?? [];

      return { ...creation, materials: expandedMaterials };
    }

    return creation;
  },
  registerTransaction: async (id, requestBody) => await REQUEST_TEMPLATE(`creations/${id}/transaction`).create(requestBody),
};
const Decision = {
  ...REQUEST_TEMPLATE('decision'),
  create: async (decision) => {
    const newDecision = {
      decision_status: decision.decision_status,
      maker_id: authUser.getUser().user_id,
    };

    return localData.decision.save(newDecision);
  },
};
const Recognition = {
  ...LOCAL_DATA_REQUEST_TEMPLATE('recognitions'),
  respond: async (id, requestBody) => await REQUEST_TEMPLATE(`recognitions/${id}/respond`).create(requestBody),
};
const Litigation = {
  ...LOCAL_DATA_REQUEST_TEMPLATE('litigations'),
  respond: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/respond`).create(requestBody),
  vote: async (id, { decision_id: decisionId }) => {
    // This takes a decision, associates it with a litigation, and updates the winner
    const litigation = localData.litigations.getById(id);
    const decision = localData.decision.getById(decisionId);
    const decisions = [...(litigation.decisions ?? []), decision];

    const votesFor = decisions.filter((x) => x.decision_status).length;
    const totalVotes = decisions.length;
    const juryCount = litigation.recognitions.length;
    const areAllVotesCast = totalVotes >= juryCount;

    const winnerUserId = (votesFor / juryCount) > 0.5
      ? litigation.issuer_id
      : (areAllVotesCast ? litigation.assumed_author.user_id : null);
    const winner = localData.users.getById(winnerUserId);

    const assumedAuthorResponse = areAllVotesCast
      ? statusTypes.WITHDRAW_CLAIM
      : litigation.assumed_author_response;

    localData.litigations.save({
      ...litigation, decisions, winner, assumed_author_response: assumedAuthorResponse,
    });
  },
  claimOwnership: async (id, requestBody) => await REQUEST_TEMPLATE(`litigations/${id}/claim-ownership`).create(requestBody),
  getAll: async (queryParameters) => {
    const litigations = localData.litigations.fetchAll({ asList: true });

    // TODO: Handle 'assumed_author' query
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
  getById: async (id, queryParameters) => {
    let litigation = localData.litigations.getById(id);

    if (queryParameters?.includes('material_id')) {
      const material = localData.materials.getById(litigation.material_id);
      litigation = { ...litigation, material };
    }

    if (queryParameters?.includes('creation_id')) {
      const creation = localData.creations.getById(litigation.creation_id);
      litigation = { ...litigation, creation };
    }

    return litigation;
  },
};
const Tag = LOCAL_DATA_REQUEST_TEMPLATE('tags');
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
