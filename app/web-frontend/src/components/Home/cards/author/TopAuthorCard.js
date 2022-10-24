import './authorcard.css';

function TopAuthorCard({ author, handleAuthorCardClick }) {
  return (
    <div
      className="topauthor-card"
      key={author.id}
      onClick={() => handleAuthorCardClick()}
      role="button"
      tabIndex={author.id}
    >
      <div className="topauthor-image">
        <img alt="author" src={author.image_path} />
      </div>
      <div className="topauthor-body">
        <h6>
          {author.name}
        </h6>
        <span>
          {author.email}
        </span>
      </div>
    </div>
  );
}

export default TopAuthorCard;
