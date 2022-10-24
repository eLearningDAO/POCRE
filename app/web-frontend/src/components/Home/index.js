import { Grid } from '@mui/material';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LatestNewsCard from './cards/latestnews/LatestNewsCard';
import TopAuthorCard from './cards/author/TopAuthorCard';
import './home.css';
import Slider from './slider/Slider';
import useStore from './homeStore';
import TrendingCard from './cards/trending/TrendingCard';

function Home() {
  const navigate = useNavigate();
  const trendingList = useStore((state) => state.trendingList);
  const topAuthorList = useStore((state) => state.topAuthorList);
  const materialList = useStore((state) => state.materialList);
  const fetchTrending = useStore((state) => state.fetchTrending);
  const fetchAuthor = useStore((state) => state.fetchAuthor);
  const fetchMaterial = useStore((state) => state.fetchMaterial);

  useEffect(() => {
    fetchAuthor();
    fetchTrending();
    fetchMaterial();
  }, []);

  const handleAuthorCardClick = () => {
    navigate('/wallet');
  };

  const handleCreationCardClick = () => {
    navigate('/creations');
  };

  const handleRecognizedMaterialCardClick = () => {
    navigate('/creations');
  };

  const handleCreationPreview = () => {
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
                trending={trending}
                handleCreationCardClick={handleCreationCardClick}
                handleCreationPreview={handleCreationPreview}
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
