import { useQuery } from '@tanstack/react-query';
import { Material, User, Creation } from 'api/requests';

const useHome = () => {
  const {
    data: trendingList,
    isLoading: isTrendingListFetched,
  } = useQuery({
    queryKey: ['trendingCreations'],
    queryFn: async () => {
      const toPopulate = ['author_id', 'materials', 'materials.author_id'];
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
    isLoading: isTopAuthorListFetched,
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
    isLoading: isMaterialListFetched,
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
  const {
    data: sliderImages,
    isLoading: isSliderImagesFetched,
  } = useQuery({
    queryKey: ['imageMaterial'],
    queryFn: async () => {
      let imageMaterialResponse = Material.getAll(
        `limit=6&page=${1}&is_recognized=true&is_claimed=false&is_image=true`,
      );
      imageMaterialResponse = await imageMaterialResponse;
      return imageMaterialResponse.results;
    },
    staleTime: 60_000, // cache for 60 seconds
  });

  return {
    materialList,
    isMaterialListFetched,
    topAuthorList,
    isTopAuthorListFetched,
    trendingList,
    isTrendingListFetched,
    isSliderImagesFetched,
    sliderImages,
  };
};
export default useHome;
