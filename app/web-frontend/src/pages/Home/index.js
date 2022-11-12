import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LatestNewsCard from 'components/cards/LatestNews';
import TopAuthorCard from 'components/cards/TopAuthorCard';
import Loader from 'components/uicore/Loader';
import './index.css';
import Slider from 'components/slider';
import TrendingCard from 'components/cards/TrendingCard';
import useUserInfo from 'hooks/user/userInfo';
import useHome from './useHome';

function Home() {
  const navigate = useNavigate();

  const {
    trendingList,
    topAuthorList,
    materialList,
    isTrendingListFeched,
    isTopAuthorListFeched,
    isMaterialListFeched,
  } = useHome();
  const setUser = useUserInfo((s) => s.setUser);
  const handleAuthorCardClick = (userId) => {
    const authors = topAuthorList.filter((author) => author.user_id === userId);
    if (authors.length > 0) {
      setUser((previousS) => ({
        user: authors[0].userDetail ? { ...previousS } : null,
        login: authors[0].userDetail,
      }));
      navigate('/wallet');
    }
  };

  const handleCreationCardClick = (creationId) => {
    navigate(`/creations/${creationId}`);
  };

  const handleSlidClick = () => {
    navigate('/creations');
  };

  return (
    <div className="container">
      <Slider handleSlidClick={handleSlidClick} />
      <Grid container spacing={3}>
        <Grid item md={5} xs={12} sm={12} className="trending-container">
          <h4 className="home-title">Latest Co-Creations</h4>
          <div>
            {isTrendingListFeched ? <Loader /> : trendingList
              && trendingList.map((trending) => (
                <TrendingCard
                  mediaUrl={trending?.source?.site_url}
                  trending={trending}
                  handleCreationCardClick={handleCreationCardClick}
                />
              ))}
          </div>
        </Grid>
        <Grid item md={3} xs={12} sm={12} className="top-author-container">
          <h4 className="home-title">Top Authors</h4>
          <div>
            {isTopAuthorListFeched ? <Loader /> : topAuthorList
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
            {isMaterialListFeched ? <Loader /> : materialList
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
