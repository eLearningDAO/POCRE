import './authorcard.css';
import johnImage from '../../../../assets/user-image-2.jpeg';
import { accessibleOnClick } from '../../util';

function TopAuthorCard({ author, handleAuthorCardClick }) {
  return (
    <div
      className="topauthor-card"
      {...accessibleOnClick(handleAuthorCardClick, author.user_id)}
    >
      <div className="topauthor-image">
        <img alt="author" src={johnImage} />
      </div>
      <div className="topauthor-body">
        <h6>
          {author.user_name}
        </h6>
        <span>
          {author.email_address}
        </span>
      </div>
    </div>
  );
}

export default TopAuthorCard;
