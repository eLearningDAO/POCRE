import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LatestNewsCard from 'components/cards/LatestNews';
import TopAuthorCard from 'components/cards/TopAuthorCard';
import Loader from 'components/uicore/Loader';
import './index.css';
import Slider from 'components/slider';
import TrendingCard from 'components/cards/TrendingCard';
import useHome from './useHome';

function Home() {
  const navigate = useNavigate();

  const {
    trendingList,
    topAuthorList,
    materialList,
    isTrendingListFetched,
    isTopAuthorListFetched,
    isMaterialListFetched,
    sliderImages,
  } = useHome();
  const handleAuthorCardClick = (userId) => {
    navigate(`/user/${userId}`);
  };

  const handleCreationCardClick = (creationId) => {
    navigate(`/creations/${creationId}`);
  };

  const handleSlidClick = () => {
    navigate('/creations');
  };

  return (
    <div className="container">
      <Slider handleSlidClick={handleSlidClick} slideImageList={sliderImages} />
      <Grid container spacing={3}>
        <Grid item md={5} xs={12} sm={12} className="trending-container">
          <h4 className="home-title">Latest Co-Creations</h4>
          <div>
            {isTrendingListFetched ? <Loader /> : trendingList
              && trendingList.map((trending) => (
                <TrendingCard
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
              && topAuthorList.map((author) => (
                <TopAuthorCard
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
              && materialList.map((material) => (
                <LatestNewsCard
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
