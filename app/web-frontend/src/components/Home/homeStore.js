import create from 'zustand';

const trendingUrl = 'https://pocre-api.herokuapp.com/v1/creations?is_trending=true';
const topAuthorUrl = 'https://pocre-api.herokuapp.com/v1/users?top_authors=true';
const materialsUrl = 'https://pocre-api.herokuapp.com/v1/materials?is_recognized=true&is_claimed=false';

const useStore = create((set) => ({
  trendingList: [],
  topAuthorList: [],
  materialList: [],
  fetchAuthor: async () => {
    const response = await fetch(topAuthorUrl);
    const author = await response.json();
    set({ topAuthorList: author.results });
  },
  fetchMaterial: async () => {
    const response = await fetch(materialsUrl);
    const material = await response.json();
    set({ materialList: material.results });
  },
  fetchTrending: async () => {
    const response = await fetch(trendingUrl);
    const trending = await response.json();
    set({ trendingList: trending.results });
  },
}));

export default useStore;
