import Cookies from 'js-cookie';
import moment from 'moment';
import {
  Button, Grid, Typography, Chip, Snackbar, Alert,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ApproveIcon from '../../../assets/approve-icon.png';
import WithdrawIcon from '../../../assets/withdraw-icon.png';
import './index.css';
import Loader from '../../uicore/Loader';
import useHome from './useHome';

const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function LitigationCard({
  id = '',
  title = 'I want to reclaim',
  claimer = {
    name: 'bob',
    walletAddress: '73gd8egv',
  },
  assumedAuthor = {
    name: 'bob',
    walletAddress: '73gd8egv',
  },
  startDate = '27/10/2022',
  endDate = '27/10/2022',
  mode = 'info',
  // mode = info
  totalJuryMembers = 5,
  // mode = litigate
  canWithdraw = false,
  canAccept = false,
  isDeclined = false,
  onWithdraw = () => {},
  onAccept = () => {},
  // mode = closed
  winner = {
    name: 'bob',
    walletAddress: '73gd8egv',
  },
  canRedeem = true,
  isRedeemed = true,
  onRedeem = () => {},
  lostClaim = false,
  // mode = closed or mode = toJudge
  votedInFavour = null,
  votedInOpposition = null,
  notVoted = null,

}) {
  return (
    <div className="litigation-card1">
      <h2>{title}</h2>
      {/* times */}
      <div className="litigation-times">
        <Chip label={`Starts ${startDate}`} />
        <Chip label={`Ends ${endDate}`} />
      </div>
      {/* authors */}
      <div className="litigation-card-authors">
        <div className="litigation-card-author">
          <h3>Assumed Author</h3>
          <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
          <h4>{assumedAuthor.name}</h4>
          <p>{assumedAuthor.walletAddress?.slice(1, 8)}</p>
          {mode === 'closed' && winner.name === assumedAuthor.name
          && <span className="litigation-winner-label">Winner</span>}
        </div>
        <h1>vs</h1>
        <div className="litigation-card-author">
          <h3>Claimer</h3>
          <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
          <h4>{claimer.name}</h4>
          <p>{claimer.walletAddress?.slice(1, 8)}</p>
          {mode === 'closed' && winner.name === claimer.name
          && <span className="litigation-winner-label">Winner</span>}
        </div>
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
        {mode === 'info' && (
          <h3 className="litigation-jury-members-count mr-auto">
            {totalJuryMembers}
            {' '}
            jury members
          </h3>
        )}
        <a className="litigation-details-link" href={`/litigation/${id}`}>
          <h4>
            View Details
            {' '}
            {mode === 'toJudge' && notVoted ? 'To Vote' : ''}
          </h4>
          {' '}
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
        </a>
      </div>
    </div>
  );
}

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
  const navigate = useNavigate();
  const [activeLitigation, setActiveLitigation] = useState('opening');
  const {
    fetchLitigations,
    litigations,
    isFetchingLitigations,
    isTransferringOwnership,
    transferLitigatedItemOwnership,
    transferOwnershipStatus,
    setTransferOwnershipStatus,
    updateReconcilateStatus,
    updatedReconcilateStatus,
    isUpdatingReconcilateStatus,
    setUpdatedReconcilateStatus,
  } = useHome();

  useEffect(() => {
    fetchLitigations();
  }, []);

  const closeTransferNotification = () => {
    setTransferOwnershipStatus({
      success: false,
      error: null,
    });
  };

  const closeUpdateStatusNotification = () => {
    setUpdatedReconcilateStatus({
      success: false,
      error: null,
    });
  };

  const redirectToCreateLitigation = () => {
    navigate('/litigation/create');
  };

  if (isFetchingLitigations) return <Loader />;

  return (
    <>
      {isTransferringOwnership && <Loader withBackdrop size="large" />}
      {isUpdatingReconcilateStatus && <Loader withBackdrop size="large" />}
      {(transferOwnershipStatus.success || transferOwnershipStatus.error) && (
        <Snackbar open onClose={closeTransferNotification}>
          <Alert
            onClose={closeTransferNotification}
            severity={transferOwnershipStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {transferOwnershipStatus.success
              ? 'Ownership transferred!'
              : transferOwnershipStatus.error}
          </Alert>
        </Snackbar>
      )}
      {(updatedReconcilateStatus.success || updatedReconcilateStatus.error) && (
        <Snackbar open onClose={closeUpdateStatusNotification}>
          <Alert
            onClose={closeUpdateStatusNotification}
            severity={updatedReconcilateStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {updatedReconcilateStatus.success
              ? 'Litigation status updated!'
              : updatedReconcilateStatus.error}
          </Alert>
        </Snackbar>
      )}
      <Grid container className="Litigation">
        <Grid display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Typography className="inviationHeaderTitle" variant="h6">
            Litigation
          </Typography>
          <Button onClick={redirectToCreateLitigation} className="btn btn-primary">
            + Add Claim
          </Button>
        </Grid>

        <div className="toggle-bar">
          <Button
            className={`btn ${activeLitigation === 'opening' && 'btn-active'}`}
            onClick={() => setActiveLitigation('opening')}
          >
            Waiting authorship recognition
          </Button>
          <Button
            className={`btn ${activeLitigation === 'openedAgainstMe' && 'btn-active'}`}
            onClick={() => setActiveLitigation('openedAgainstMe')}
          >
            Opened against me
          </Button>
          <Button
            className={`btn ${activeLitigation === 'closed' && 'btn-active'}`}
            onClick={() => setActiveLitigation('closed')}
          >
            Closed
          </Button>
          <Button
            className={`btn ${activeLitigation === 'toJudge' && 'btn-active'}`}
            onClick={() => setActiveLitigation('toJudge')}
          >
            To judge
          </Button>
        </div>

        {litigations?.[activeLitigation]?.length > 0 ? (
          <div className="grid-container">
            {litigations?.[activeLitigation]?.map((x) => (
              <LitigationCard
                key={x}
                id={x?.litigation_id}
                title={x?.litigation_title}
                claimer={{
                  name: x?.issuer?.user_name,
                  walletAddress: x?.issuer?.wallet_address,
                }}
                assumedAuthor={{
                  name: x?.assumed_author?.user_name,
                  walletAddress: x?.assumed_author?.wallet_address,
                }}
                startDate={moment(x?.litigation_start).format('DD/MM/YYYY')}
                endDate={moment(x?.litigation_end).format('DD/MM/YYYY')}
                mode={
                  (activeLitigation === 'opening' && 'info')
                  || (activeLitigation === 'openedAgainstMe' && 'litigate')
                  || (activeLitigation === 'closed' && 'closed')
                  || (activeLitigation === 'toJudge' && 'toJudge')
                }
                notVoted={
                  x?.toJudge
                  && (x?.decisions?.length === 0
                  || !x?.decisions?.find((decision) => decision.maker_id === authUser.user_id))
                }
                votedInFavour={
                  x?.toJudge
                  && x?.decisions?.find(
                    (decision) => decision.maker_id === authUser.user_id
                    && decision.decision_status,
                  )
                }
                votedInOpposition={
                  x?.toJudge
                  && x?.decisions?.find(
                    (decision) => decision.maker_id === authUser.user_id
                    && !decision.decision_status,
                  )
                }
                totalJuryMembers={x?.invitations?.length}
                canWithdraw={!x?.toJudge ? x?.reconcilate === null : null}
                // eslint-disable-next-line no-return-await
                onWithdraw={async () => await updateReconcilateStatus(x?.litigation_id, true)}
                canAccept={!x?.toJudge ? x?.reconcilate === null : null}
                isDeclined={!x?.toJudge ? x?.reconcilate : null}
                // eslint-disable-next-line no-return-await
                onAccept={async () => await updateReconcilateStatus(x?.litigation_id, false)}
                canRedeem={!x?.toJudge
                  ? x?.winner?.wallet_address === authUser?.wallet_address : null}
                isRedeemed={!x?.toJudge ? x?.ownership_transferred : null}
                lostClaim={!x?.toJudge
                  ? x?.winner?.wallet_address !== authUser?.wallet_address : null}
                // eslint-disable-next-line no-return-await
                onRedeem={async () => await transferLitigatedItemOwnership(x?.litigation_id)}
                winner={{
                  name: x?.winner?.user_name,
                  walletAddress: x?.winner?.wallet_address,
                }}
              />
            ))}
          </div>
        )
          : <h3 className="m-auto p-64">Nothing here yet!</h3>}
      </Grid>
    </>
  );
}

export default Litigation;
