import './index.css';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';

function TopAuthorCard({ author, handleAuthorCardClick }) {
  return (
    <div
      className="topauthor-card"
      {...accessibleOnClick(handleAuthorCardClick, author.user_id)}
    >
      <div className="topauthor-image">
        <img alt="author" src={author.image_url != null ? author.image_url : 'http://res.cloudinary.com/dia0ztihb/image/upload/v1669676677/Screenshot_2022-11-29_at_2.54.07_AM_xo13v8.png'} />
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
