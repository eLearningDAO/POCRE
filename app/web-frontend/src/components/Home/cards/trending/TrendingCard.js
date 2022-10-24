import { Button } from '@mui/material';
import CourseCard1 from '../../../../assets/course-card2.png';
import './trending.css';

function TrendingCard({ trending }) {
  return (
    <div className="trending-card" key={trending}>
      <div className="trending-img">
        <img alt="course-card" src={CourseCard1} />
      </div>
      <div className="trending-detial">
        <div>
          <h6 className="trending-title">
            Flutter building
          </h6>
          <span className="trending-body">
            1000+ free files you deliver real-time metrics for actionalble results.
          </span>
        </div>
        <Button className="trending-btn">Preview</Button>
      </div>
    </div>
  );
}

export default TrendingCard;
