import { Button } from '@mui/material';
import CourseCard1 from '../../../../assets/course-card2.png';
import './trending.css';

function TrendingCard({ trending, handleCreationCardClick, handleCreationPreview }) {
  return (
    <div
      className="trending-card"
      key={trending.creation_id}
      onClick={() => handleCreationCardClick()}
      role="button"
      tabIndex={trending.creation_id}
    >
      <div className="trending-img">
        <img alt="course-card" src={CourseCard1} />
      </div>
      <div className="trending-detial">
        <div>
          <h6 className="trending-title">
            {trending.creation_title}
          </h6>
          <span className="trending-body">
            {trending.creation_description}
          </span>
        </div>
        <Button className="trending-btn" onClick={handleCreationPreview}>Preview</Button>
      </div>
    </div>
  );
}

export default TrendingCard;
