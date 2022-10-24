import LatestNewsCardImg from '../../../../assets/svgs/newsimage.svg';
import { accessibleOnClick } from '../../util';
import './latestnewscard.css';
// date is missing in material api json data.
function LatestNewsCard({ material, handleRecognizedMaterialCardClick }) {
  return (
    <div
      className="latest-news-card"
      {...accessibleOnClick(handleRecognizedMaterialCardClick, material.material_id)}
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
