import moment from 'moment';
import {
  Button, Grid, Typography, Chip,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import ApproveIcon from '../../../assets/approve-icon.png';
import WithdrawIcon from '../../../assets/withdraw-icon.png';
import './index.css';
import Loader from '../../uicore/Loader';
import useDashboard from './useDashboard';

function LitigationCard({
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
  onWithdraw = () => {},
  onAccept = () => {},
  // mode = closed
  canRedeem = true,
  onRedeem = () => {},
  winner = {
    name: 'bob',
    walletAddress: '73gd8egv',
  },
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
      {/* modes */}
      <div className="litigation-card-options">
        {mode === 'closed'
        && (
          (canRedeem && (
          <Button onClick={onRedeem} className="approveButton">
            Redeem
          </Button>
          ))
        )}
        {mode === 'litigate'
        && (
          (canWithdraw && (
          <Button onClick={onWithdraw} className="withdrawButton">
            <img src={WithdrawIcon} alt="withdraw" />
            Withdraw
          </Button>
          ))
          || (canAccept && (
          <Button onClick={onAccept} className="approveButton">
            <img src={ApproveIcon} alt="withdraw" />
            Approve
          </Button>
          ))
        )}
        {mode === 'info' && (
          <h3 className="litigation-jury-members-count mr-auto">
            {totalJuryMembers}
            {' '}
            jury members
          </h3>
        )}
        <div className="litigation-details-link">
          <h4>
            View Details
          </h4>
          {' '}
          <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 1024 1024" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-.7 5.2-2L869 536.2a32.07 32.07 0 0 0 0-48.4z" /></svg>
        </div>
      </div>
    </div>
  );
}

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
  const [activeLitigation, setActiveLitigation] = useState('opening');
  const { fetchLitigations, litigations, isFetchingLitigations } = useDashboard();

  useEffect(() => {
    fetchLitigations();
  }, []);

  if (isFetchingLitigations) return <Loader />;

  return (
    <Grid container className="Litigation">
      <Grid item xs={12}>
        <Typography className="inviationHeaderTitle" variant="h6">
          Litigation
        </Typography>
      </Grid>

      <div className="toggle-bar">
        <Button
          className={`btn ${activeLitigation === 'opening' && 'btn-active'}`}
          onClick={() => setActiveLitigation('opening')}
        >
          Opening
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

      {litigations?.results?.[activeLitigation]?.length > 0 ? (
        <div className="grid-container">
          {litigations?.results?.[activeLitigation]?.map((x, index) => (
            <LitigationCard
              key={x}
              title={x?.litigation_title}
              claimer={{
                name: x?.issuer?.user_name,
                walletAddress: x?.issuer?.wallet_address,
              }}
              assumedAuthor={{
                name: x?.assumed_author?.user_name,
                walletAddress: x?.assumed_author?.wallet_address,
              }}
              startDate={moment(x.litigation_start).format('DD/MM/YYYY')}
              endDate={moment(x.litigation_end).format('DD/MM/YYYY')}
              mode={
                (activeLitigation === 'opening' && 'info')
                || (activeLitigation === 'openedAgainstMe' && 'litigate')
                || (activeLitigation === 'closed' && 'closed')
              }
              canWithdraw={index % 2 === 0}
              canAccept={index % 2 !== 0}
              canRedeem
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
  );
}

export default Litigation;
