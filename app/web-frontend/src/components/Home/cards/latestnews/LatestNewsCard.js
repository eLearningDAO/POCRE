import LatestNewsCardImg from '../../../../assets/svgs/newsimage.svg';
import './latestnewscard.css';

function LatestNewsCard({ id }) {
  return (
    <div className="latest-news-card" key={id}>
      <div className="latest-news-image-container">
        <img alt="course-card" src={LatestNewsCardImg} />
      </div>
      <div className="latest-news-body">
        <h6>
          Amet minim mollit non deserunt ullamco
        </h6>
        <span>
          May 15, 2022
        </span>
      </div>
    </div>
  );
}
export default LatestNewsCard;
