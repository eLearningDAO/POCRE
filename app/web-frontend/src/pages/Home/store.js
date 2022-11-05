import create from 'zustand';
import { Material, User, Creation } from 'api/requests';

const initialState = {
  trendingList: [],
  topAuthorList: [],
  materialList: [],
  isTrendingListFeched: false,
  isTopAuthorListFeched: false,
  isMaterialListFeched: false,
};

const useStore = create((set) => ({
  ...initialState,
  fetchAuthor: async () => {
    set({ isTopAuthorListFeched: true });
    const authorResponse = await User.getAll(
      `limit=5&page=${1}&top_authors=true`,
    );
    const authorWithAvatarResponse = await Promise.all(
      authorResponse?.results?.map(async (response) => ({ ...response, avatar: `https://i.pravatar.cc/50?img=${Math.random()}` })),
    );
    set({ isTopAuthorListFeched: false, topAuthorList: authorWithAvatarResponse });
  },
  fetchMaterial: async () => {
    set({ isMaterialListFeched: true });
    const materialResponse = await Material.getAll(
      `limit=5&page=${1}&is_recognized=true&is_claimed=false`,
    );
    set({ isMaterialListFeched: false, materialList: materialResponse.results });
  },
  fetchTrending: async () => {
    set({ isTrendingListFeched: true });
    const toPopulate = [
      'source_id',
      'author_id',
      'materials',
      'materials.source_id',
      'materials.type_id',
      'materials.author_id',
    ];
    const creationResponse = await Creation.getAll(
      `page=${1}&limit=5&descend_fields[]=creation_date&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
    );
    set({ isTrendingListFeched: false, trendingList: creationResponse.results });
  },
}));

export default useStore;
