import { useQuery } from '@tanstack/react-query';
import { Material, User, Creation } from 'api/requests';
import SliderImage1 from 'assets/images/slider-01.jpg';
import SliderImage2 from 'assets/images/slider-02.jpg';
import SliderImage3 from 'assets/images/slider-03.jpg';
import SliderImage4 from 'assets/images/slider-04.jpg';
import SliderImage5 from 'assets/images/slider-05.jpg';

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
  const {
    data: sliderImages,
    isLoading: isSliderImagesLoaded,
  } = useQuery({
    queryKey: ['homeSlider'],
    queryFn: () => [
      {
        id: 1,
        imageUrl: SliderImage1,
      },
      {
        id: 2,
        imageUrl: SliderImage2,
      },
      {
        id: 3,
        imageUrl: SliderImage3,
      },
      {
        id: 4,
        imageUrl: SliderImage4,
      },
      {
        id: 5,
        imageUrl: SliderImage5,
      },
    ],
    staleTime: 60_000, // cache for 60 seconds
  });
  return {
    materialList,
    isMaterialListFeched,
    topAuthorList,
    isTopAuthorListFeched,
    trendingList,
    isTrendingListFeched,
    sliderImages,
    isSliderImagesLoaded,
  };
};
export default useHome;
