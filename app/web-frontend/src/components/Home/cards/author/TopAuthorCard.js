import './authorcard.css';
import johnImage from '../../../../assets/user-image-2.jpeg';

function TopAuthorCard({ author, handleAuthorCardClick }) {
  return (
    <div
      className="topauthor-card"
      key={author.user_id}
      onClick={() => handleAuthorCardClick()}
      role="button"
      tabIndex={author.user_id}
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
