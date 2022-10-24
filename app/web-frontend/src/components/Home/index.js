import { Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LatestNewsCard from './cards/latestnews/LatestNewsCard';
import TopAuthorCard from './cards/author/TopAuthorCard';
import './home.css';
import Slider from './slider/Slider';
import TrendingCard from './cards/trending/TrendingCard';
import johnImage from '../../assets/user-image-2.jpeg';

const topAuthorList = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@gmail.com',
    image_path: johnImage,
  },
  {
    id: 2,
    name: 'Esther Howard',
    email: 'esther@gmail.com',
    image_path: johnImage,

  },
  {
    id: 3,
    name: 'Brooklyn Simmons',
    email: 'brook@gmail.com',
    image_path: johnImage,

  },
  {
    id: 4,
    name: 'Jenny Wilson',
    email: 'jenny@gmail.com',
    image_path: johnImage,
  },
  {
    id: 5,
    name: 'Cody Fisher',
    email: 'cody@gmail.com',
    image_path: johnImage,
  },
];

function Home() {
  const navigate = useNavigate();

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
            {[1, 2].map((trending) => (
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
            {topAuthorList.map((author) => (
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
            {[1, 2, 3].map((card) => (
              <LatestNewsCard
                material={card}
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
