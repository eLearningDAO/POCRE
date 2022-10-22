import { Button } from '@mui/material';
import CourseCard1 from '../../../../assets/course-card2.png';
import './trending.css';

function CourseCard({ trending }) {
  return (
    <div className="trending-card" key={trending}>
      <div className="trending-img">
        <img alt="course-card" width="180" src={CourseCard1} />
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
        <Button className="trending-btn">Enroll Course</Button>
      </div>
    </div>
  );
}

export default CourseCard;
