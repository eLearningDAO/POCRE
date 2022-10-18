import moment from 'moment';
import {
  Button, Grid, Typography,
} from '@mui/material';
import React, { useEffect } from 'react';
import ApproveIcon from '../../../assets/approve-icon.png';
import WithdrawIcon from '../../../assets/withdraw-icon.png';
import './index.css';
import Loader from '../../uicore/Loader';
import useDashboard from './useDashboard';

function LitigatedItemRow({
  title = 'I want to reclaim',
  issuer = {
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
  winner = {
    name: 'bob',
    walletAddress: '73gd8egv',
  },
}) {
  return (
    <tr className="litigationBoxBody">
      <td>{title}</td>
      <td className="responsive">
        <div className="litigationUser">
          <div className="litigationUserImage">
            <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
          </div>
          <div className="litigationUserText">
            <h6>{issuer?.name}</h6>
            {issuer?.walletAddress?.slice(1, 8)}
          </div>
        </div>
      </td>
      <td className="responsive">
        <div className="litigationUser">
          <div className="litigationUserImage">
            <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
          </div>
          <div className="litigationUserText">
            <h6>{assumedAuthor?.name}</h6>
            {assumedAuthor?.walletAddress?.slice(1, 8)}
          </div>
        </div>
      </td>
      <td className="responsive">{startDate}</td>
      <td className="responsive">{endDate}</td>
      <td className="responsive">
        {mode === 'info' && totalJuryMembers}
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
        {mode === 'closed'
        && (
        <div className="litigationUser">
          <div className="litigationUserImage">
            <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
          </div>
          <div className="litigationUserText">
            <h6>{winner?.name}</h6>
            {winner?.walletAddress?.slice(1, 8)}
          </div>
        </div>
        )}
      </td>
    </tr>
  );
}

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
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

      {litigations?.results?.opening?.length > 0 && (
      <>
        <Grid item xs={12} style={{ marginTop: '10px' }}>
          <Typography className="inviationSectionTitle" variant="h6">
            Waiting authorship recognition
          </Typography>
        </Grid>

        <table className="litigationBox">
          <tr className="litigationBoxHeader">
            <th>Creation Title</th>
            <th className="responsive">Claimer</th>
            <th className="responsive">Assumed Author</th>
            <th className="responsive">Litigation Start</th>
            <th className="responsive">Deadline</th>
            <th className="responsive">Total jurors</th>
          </tr>

          {litigations?.results?.opening?.map((x) => (
            <LitigatedItemRow
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
              mode="info"
              totalJuryMembers={x?.invitations?.length}
            />
          ))}
        </table>
      </>
      )}

      {litigations?.results?.openedAgainstMe?.length > 0 && (
      <>
        <Grid item xs={12} style={{ marginTop: '20px' }}>
          <Typography className="inviationSectionTitle" variant="h6">
            Opened against me
          </Typography>
        </Grid>

        <table className="litigationBox">
          <tr className="litigationBoxHeader">
            <th>Creation Title</th>
            <th className="responsive">Claimer</th>
            <th className="responsive">Assumed Author</th>
            <th className="responsive">Litigation Start</th>
            <th className="responsive">Deadline</th>
            <th className="responsive">Actions</th>
          </tr>

          {litigations?.results?.openedAgainstMe?.map((x, index) => (
            <LitigatedItemRow
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
              mode="litigate"
              canWithdraw={index % 2 === 0}
              canAccept={index % 2 !== 0}
            />
          ))}
        </table>
      </>
      )}

      {litigations?.results?.closed?.length > 0 && (
      <>
        <Grid item xs={12} style={{ marginTop: '20px' }}>
          <Typography className="inviationSectionTitle" variant="h6">
            Closed
          </Typography>
        </Grid>

        <table className="litigationBox">
          <tr className="litigationBoxHeader">
            <th>Creation Title</th>
            <th className="responsive">Claimer</th>
            <th className="responsive">Assumed Author</th>
            <th className="responsive">Litigation Start</th>
            <th className="responsive">Deadline</th>
            <th className="responsive">Winner</th>
          </tr>

          {litigations?.results?.closed?.map((x) => (
            <LitigatedItemRow
              key={`${x}`}
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
              mode="closed"
              winner={{
                name: x?.winner?.user_name,
                walletAddress: x?.winner?.wallet_address,
              }}
            />
          ))}

        </table>
      </>
      )}
    </Grid>
  );
}

export default Litigation;
