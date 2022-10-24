import LatestNewsCardImg from '../../../../assets/svgs/newsimage.svg';
import './latestnewscard.css';
// date is missing in material api json data.
function LatestNewsCard({ material, handleRecognizedMaterialCardClick }) {
  return (
    <div
      className="latest-news-card"
      key={material.material_id}
      onClick={() => handleRecognizedMaterialCardClick()}
      role="button"
      tabIndex={material.material_id}
    >
      <div className="latest-news-image-container">
        <img alt="course-card" src={LatestNewsCardImg} />
      </div>
      <div className="latest-news-body">
        <h6>
          {material.material_title}
        </h6>
        <span>
          May 15, 2022
        </span>
      </div>
    </div>
  );
}
export default LatestNewsCard;
