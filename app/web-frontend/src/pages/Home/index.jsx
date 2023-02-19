import { Box, Grid } from '@mui/material';
import LatestNewsCard from 'components/cards/LatestNews';
import TopAuthorCard from 'components/cards/TopAuthorCard';
import TrendingCard from 'components/cards/TrendingCard';
import Slider from 'components/slider';
import Loader from 'components/uicore/Loader';
import { useNavigate } from 'react-router-dom';
import './index.css';
import useHome from './useHome';

const getSliderImages = (imageCreations) => {
  const sliderImages = [];
  if (imageCreations) {
    imageCreations.map(
      (creation) => {
        if (creation.creation_type === 'image') {
          sliderImages.push(
            {
              id: creation.creation_id,
              imageUrl: creation.creation_link,
            },
          );
        }
        return 1;
      },
    );
  }
  return sliderImages;
};

function Home() {
  const navigate = useNavigate();

  const {
    trendingList,
    topAuthorList,
    materialList,
    isTrendingListFetched,
    isTopAuthorListFetched,
    isMaterialListFetched,
    isSliderImagesFetched,
    sliderImagesStatus,
    sliderImages,
  } = useHome();
  const handleAuthorCardClick = (userId) => {
    navigate(`/wallet/${userId}`);
  };

  const handleCreationCardClick = (creationId) => {
    navigate(`/creations/${creationId}`);
  };

  const handleSlideClick = (creationId) => {
    navigate(`/creations/${creationId}`);
  };

  return (
    <div className="container">
      {(sliderImagesStatus.error)
        && (
          <Box width="100%" className={`${sliderImagesStatus.success ? 'bg-green' : 'bg-red'} color-white`} padding="16px" borderRadius="12px" fontSize="16px" style={{ margin: 'auto', marginTop: '18px' }}>
            {sliderImagesStatus.success ? 'Success! A new litigation was made.' : sliderImagesStatus.error}
          </Box>
        )}
      {
        isSliderImagesFetched ? <Loader /> : (
          sliderImages && getSliderImages(sliderImages).length > 0 && (
            <Slider
              handleSlideClick={handleSlideClick}
              slideImageList={getSliderImages(sliderImages)}
            />
          )
        )
      }
      <Grid container spacing={3}>
        <Grid item md={5} xs={12} sm={12} className="trending-container">
          <h4 className="home-title">Latest Co-Creations</h4>
          <div>
            {isTrendingListFetched ? <Loader /> : trendingList
              && trendingList.map((trending, index) => (
                <TrendingCard
                  key={index}
                  mediaUrl={trending?.creation_link}
                  trending={trending}
                  handleCreationCardClick={handleCreationCardClick}
                />
              ))}
          </div>
        </Grid>
        <Grid item md={3} xs={12} sm={12} className="top-author-container">
          <h4 className="home-title">Top Authors</h4>
          <div>
            {isTopAuthorListFetched ? <Loader /> : topAuthorList
              && topAuthorList.map((author, index) => (
                <TopAuthorCard
                  key={index}
                  author={author}
                  handleAuthorCardClick={handleAuthorCardClick}
                />
              ))}
          </div>
        </Grid>
        <Grid item md={4} xs={12} sm={12} className="latest-material-container">
          <h4 className="home-title">Latest recognized materials</h4>
          <div>
            {isMaterialListFetched ? <Loader /> : materialList
              && materialList.map((material, index) => (
                <LatestNewsCard
                  key={index}
                  material={material}
                  mediaUrl={material?.material_link}
                />
              ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
