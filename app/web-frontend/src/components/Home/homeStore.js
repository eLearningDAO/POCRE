import Cookies from 'js-cookie';
import create from 'zustand';
import { API_BASE_URL } from '../../config';

const trendingUrl = 'https://pocre-api.herokuapp.com/v1/creations?is_trending=true';
const topAuthorUrl = 'https://pocre-api.herokuapp.com/v1/users?top_authors=true';
const materialsUrl = 'https://pocre-api.herokuapp.com/v1/materials?is_recognized=true&is_claimed=false';
const user = JSON.parse(Cookies.get('activeUser') || '{}');

const useStore = create((set) => ({
  trendingList: [],
  topAuthorList: [],
  materialList: [],
  fetchAuthor: async () => {
    const response = await fetch(topAuthorUrl);
    const author = await response.json();
    const usersWithAvatar = author.results.map((x) => ({
      ...x,
      avatar: `https://i.pravatar.cc/50?img=${Math.random()}`,
    }));
    set({ topAuthorList: usersWithAvatar });
  },
  fetchMaterial: async () => {
    let materialResponse = await fetch(materialsUrl).then((response) => response.json());
    if (materialResponse.code >= 400) throw new Error('Failed to fetch material');

    materialResponse = {
      ...materialResponse,
      results: await Promise.all(materialResponse?.results?.map(async (response) => {
        const creation = { ...response };
        const source = await fetch(
          `${API_BASE_URL}/source/${response.source_id}`,
        ).then((y) => y.json()).catch(() => null);
        delete creation.source_id;
        return {
          ...creation,
          source,
        };
      })),
    };

    set({ materialList: materialResponse.results });
  },
  fetchTrending: async () => {
    let creationResponse = await fetch(trendingUrl).then((response) => response.json());
    if (creationResponse.code >= 400) throw new Error('Failed to fetch creations');
    creationResponse = {
      ...creationResponse,
      results: await Promise.all(creationResponse?.results?.map(async (x) => {
        const creation = { ...x };
        // get details about creation source
        const source = await fetch(
          `${API_BASE_URL}/source/${x.source_id}`,
        ).then((y) => y.json()).catch(() => null);
        delete creation.source_id;

        // get details about the creation materials
        const materials = creation?.materials?.length > 0
          ? await Promise.all(creation.materials.map(async (materialId) => {
            // get material detail
            const material = await fetch(
              `${API_BASE_URL}/materials/${materialId}`,
            ).then((y) => y.json()).catch(() => null);

            // get type detail
            const materialType = await fetch(
              `${API_BASE_URL}/material-type/${material?.type_id}`,
            ).then((y) => y.json()).catch(() => null);
            delete material.type_id;
            material.type = materialType;

            // get author detail
            const author = await fetch(
              `${API_BASE_URL}/users/${material?.author_id}`,
            ).then((y) => y.json()).catch(() => null);
            delete material.author_id;
            material.author = author;

            return material;
          })) : [];
        delete creation.materials;
        creation.materials = materials;

        // get details about the creation author
        delete creation.author_id;
        creation.author = user;

        return {
          ...creation,
          title: creation.title + creation.creation_id,
          source,
        };
      })),
    };
    set({ trendingList: creationResponse.results });
  },
}));

export default useStore;
