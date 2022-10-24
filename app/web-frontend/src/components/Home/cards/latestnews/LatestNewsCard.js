import LatestNewsCardImg from '../../../../assets/svgs/newsimage.svg';
import './latestnewscard.css';

function LatestNewsCard({ material, handleRecognizedMaterialCardClick }) {
  return (
    <div
      className="latest-news-card"
      key={material}
      onClick={() => handleRecognizedMaterialCardClick()}
      role="button"
      tabIndex={material}
    >
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
