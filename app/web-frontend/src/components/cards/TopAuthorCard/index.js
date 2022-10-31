import './index.css';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';

function TopAuthorCard({ author, handleAuthorCardClick }) {
  return (
    <div
      className="topauthor-card"
      {...accessibleOnClick(handleAuthorCardClick, author.user_id)}
    >
      <div className="topauthor-image">
        <img alt="author" src={author.userDetail.avatar} />
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
