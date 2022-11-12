import { useQuery } from '@tanstack/react-query';
import { Material, User, Creation } from 'api/requests';

const useHome = () => {
  const {
    data: trendingList,
    isLoading: isTrendingListFeched,
  } = useQuery({
    queryKey: ['trendingCreations'],
    queryFn: async () => {
      const toPopulate = ['source_id', 'author_id', 'materials', 'materials.source_id', 'materials.type_id', 'materials.author_id'];
      let createResponse = Creation.getAll(
        `page=${1}&limit=5&descend_fields[]=creation_date&${toPopulate.map((x) => `populate=${x}`).join('&')}`,
      );
      createResponse = await createResponse;
      return createResponse.results;
    },
    staleTime: 60_000, // cache for 60 seconds
  });
  const {
    data: topAuthorList,
    isLoading: isTopAuthorListFeched,
  } = useQuery({
    queryKey: ['topAuthorCreations'],
    queryFn: async () => {
      const authorResponse = await User.getAll(
        `limit=10&page=${1}&top_authors=true`,
      );
      return await Promise.all(
        authorResponse?.results?.map(async (response) => ({ ...response, avatar: `https://i.pravatar.cc/50?img=${Math.random()}` })),
      );
    },
    staleTime: 60_000, // cache for 60 seconds
  });
  const {
    data: materialList,
    isLoading: isMaterialListFeched,
  } = useQuery({
    queryKey: ['trendingMaterial'],
    queryFn: async () => {
      let materialResponse = Material.getAll(
        `limit=6&page=${1}&is_recognized=true&is_claimed=false`,
      );
      materialResponse = await materialResponse;
      return materialResponse.results;
    },
    staleTime: 60_000, // cache for 60 seconds
  });
  return {
    materialList,
    isMaterialListFeched,
    topAuthorList,
    isTopAuthorListFeched,
    trendingList,
    isTrendingListFeched,
  };
};
export default useHome;
