import { Button } from '@mui/material';
import CourseCard1 from '../../../../assets/course-card2.png';
import './trending.css';
/**
 * i have used trending keyword which equal to creation
 * @param {*} param0
 * @returns
 */
function TrendingCard({ trending, handleCreationCardClick, handleCreationPreview }) {
  return (
    <div
      className="trending-card"
      key={trending}
      onClick={() => handleCreationCardClick()}
      role="button"
      tabIndex={trending}
    >
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
        <Button className="trending-btn" onClick={handleCreationPreview}>Preview</Button>
      </div>
    </div>
  );
}

export default TrendingCard;
