import {
  Button, Chip,
} from '@mui/material';
import ApproveIcon from 'assets/images/approve-icon.png';
import WithdrawIcon from 'assets/images/withdraw-icon.png';
import { Link } from 'react-router-dom';
import './index.css';

function LitigationCard({
  id = '',
  title = '',
  claimer = {
    profileId: '',
    name: '',
    image: '',
  },
  assumedAuthor = {
    profileId: '',
    name: '',
    image: '',
  },
  startDate,
  endDate,
  isPendingPaymentConfirmation = false,
  mode = 'info', // can be [info,litigate,closed,toJudge,drafted]
  // mode = info
  totalJuryMembers,
  // mode = litigate
  canWithdraw,
  canAccept,
  isDeclined,
  onWithdraw = () => {},
  onAccept = () => {},
  // mode = closed
  winner = {
    profileId: '',
    name: '',
    image: '',
  },
  canRedeem,
  isRedeemed,
  onRedeem = () => {},
  lostClaim,
  // mode = closed or mode = toJudge
  votedInFavour = null,
  votedInOpposition = null,
  notVoted = null,
  // mode = drafted
  onUpdate = () => {},
}) {
  const renderAuthor = (author, heading) => (
    <div className="litigation-card-author">
      <h3>{heading}</h3>
      <Link to={`/wallet/${author?.profileId}`}>
        <img
          alt=""
          src={author?.image}
          className="profile-pic profile-pic-small profile-pic-rounded"
        />
      </Link>
      <Link to={`/wallet/${author?.profileId}`}>
        <h4>{author?.name}</h4>
      </Link>
      {mode === 'closed' && winner?.name === author?.name
    && <span className="litigation-winner-label">Winner</span>}
    </div>
  );

  return (
    <div className="litigation-card1">
      <h2>{title}</h2>
      {/* times */}
      {(startDate || endDate) && (
        <div className="litigation-times">
          {startDate && <Chip label={`Starts ${startDate}`} />}
          {endDate && <Chip label={`Ends ${endDate}`} />}
        </div>
      )}
      {/* authors */}
      <div className="litigation-card-authors">
        {renderAuthor(assumedAuthor, 'Assumed Author')}
        <h1>vs</h1>
        {renderAuthor(claimer, 'Claimer')}
      </div>
      {mode === 'litigate'
        && (
          <div className="litigation-action-buttons">
            {canWithdraw && (
              <Button onClick={onWithdraw} className="btn withdrawButton">
                <img src={WithdrawIcon} alt="withdraw" />
                Withdraw
              </Button>
            )}
            {canAccept && (
              <Button onClick={onAccept} className="btn approveButton">
                <img src={ApproveIcon} alt="withdraw" />
                Start litigation
              </Button>
            )}
          </div>
        )}
      {/* modes */}
      <div className="litigation-card-options">
        {mode === 'closed' && canRedeem
          && votedInFavour === null
          && votedInOpposition === null
          && notVoted === null
          && (
            (!isRedeemed ? (
              <Button onClick={onRedeem} className="approveButton">
                Redeem
              </Button>
            ) : (
              <h3 className="litigation-jury-members-count mr-auto">
                Redeemed
              </h3>
            ))
          )}
        {mode === 'closed' && !canRedeem
          && votedInFavour === null
          && votedInOpposition === null
          && notVoted === null
          && lostClaim && (
            <Chip
              className="color-white bg-red"
              label="You lost the claim"
            />
        )}
        {((mode === 'closed' && !canRedeem
          && (
            votedInFavour
            || votedInOpposition
            || notVoted
          )) || mode === 'toJudge')
          && (
            (votedInFavour && (
              <Chip
                style={{ fontSize: '14px' }}
                className="color-white bg-green"
                label="Voted in favor"
              />
            ))
            || (votedInOpposition && (
              <Chip
                style={{ fontSize: '14px' }}
                className="color-white bg-red"
                label="Voted in opposition"
              />
            ))
            || (notVoted && (
              <Chip
                style={{ fontSize: '14px' }}
                className="color-white bg-black"
                label="Vote not casted"
              />
            ))
          )}
        {mode === 'litigate'
          && !isDeclined && !canAccept && !canWithdraw
          && (
            <h3 className="litigation-jury-members-count mr-auto">
              In voting process
            </h3>
          )}
        {mode === 'info' && totalJuryMembers && (
          <h3 className="litigation-jury-members-count mr-auto">
            {totalJuryMembers}
            {' '}
            jury members
          </h3>
        )}
        {
          mode === 'drafted'
            ? (
              <Button onClick={onUpdate} className="btn approveButton" style={{ marginLeft: 'auto' }}>
                Update
              </Button>
            )
            : (
              <Link className="litigation-details-link" to={`/litigations/${id}`}>
                <h4>
                  View Details
                  {' '}
                  {mode === 'toJudge' && notVoted ? 'To Vote' : ''}
                </h4>
                {' '}
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
              </Link>
            )
        }
      </div>

      {/* payment pending status */}
      {(isPendingPaymentConfirmation) && (
        <Chip
          style={{ fontSize: '16px' }}
          label="Pending payment confirmation"
          className="color-white bg-black w-full"
        />
      )}
    </div>
  );
}

export default LitigationCard;
