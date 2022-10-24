import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LatestNewsCard from './cards/latestnews/LatestNewsCard';
import TopAuthorCard from './cards/author/TopAuthorCard';
import './home.css';
import Slider from './slider/Slider';
import useStore from './homeStore';
import TrendingCard from './cards/trending/TrendingCard';
import useUserInfo from '../../hooks/user/userInfo';

function Home() {
  const navigate = useNavigate();
  const trendingList = useStore((state) => state.trendingList);
  const topAuthorList = useStore((state) => state.topAuthorList);
  const materialList = useStore((state) => state.materialList);
  const fetchTrending = useStore((state) => state.fetchTrending);
  const fetchAuthor = useStore((state) => state.fetchAuthor);
  const fetchMaterial = useStore((state) => state.fetchMaterial);
  const setUser = useUserInfo((s) => s.setUser);

  useEffect(() => {
    fetchAuthor();
    fetchTrending();
    fetchMaterial();
  }, []);

  const handleAuthorCardClick = (userId) => {
    const authors = topAuthorList.filter((author) => author.user_id === userId);
    if (authors.length > 0) {
      setUser((previousS) => ({ user: authors[0] ? { ...previousS } : null, login: authors[0] }));
      navigate('/wallet');
    }
  };

  const handleCreationCardClick = (creationId) => {
    navigate(`/creations/${creationId}`);
  };

  const handleRecognizedMaterialCardClick = () => {
    navigate('/creations');
  };

  const handleSlidClick = () => {
    navigate('/creations');
  };

  return (
    <div className="container">
      <Slider
        handleSlidClick={handleSlidClick}
      />
      <Grid container spacing={3}>
        <Grid item md={5} xs={12} sm={12} className="trending-container">
          <h4 className="home-title">Latest Co-Creations</h4>
          <div>
            {trendingList && trendingList.map((trending) => (
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
            {topAuthorList && topAuthorList.map((author) => (
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
            {materialList && materialList.map((material) => (
              <LatestNewsCard
                material={material}
                handleRecognizedMaterialCardClick={handleRecognizedMaterialCardClick}
              />
            ))}
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

export default Home;
