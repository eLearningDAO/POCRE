import {
  Alert, Button, Grid, Snackbar, Typography,
} from '@mui/material';
import Loader from 'components/uicore/Loader';
import Cookies from 'js-cookie';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import LitigationCard from 'components/cards/LitigationCard';
import useHome from './useHome';

const authUser = JSON.parse(Cookies.get('activeUser') || '{}');

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
  const navigate = useNavigate();
  const [activeLitigation, setActiveLitigation] = useState('opening');
  const {
    isFetchingLitigations,
    litigations,
    fetchLitigations,
    isUpdatingReconcilateStatus,
    updatedReconcilateStatus,
    updateReconcilateStatus,
    resetReconcilateStatus,
    isTransferringOwnership,
    transferOwnershipStatus,
    resetTransferOwnershipStatus,
    transferLitigatedItemOwnership,
  } = useHome();

  useEffect(() => {
    fetchLitigations();
  }, []);

  const redirectToCreateLitigation = () => {
    navigate('/litigations/create');
  };

  if (isFetchingLitigations) return <Loader />;

  return (
    <>
      {isTransferringOwnership && <Loader withBackdrop size="large" />}
      {isUpdatingReconcilateStatus && <Loader withBackdrop size="large" />}
      {(transferOwnershipStatus.success || transferOwnershipStatus.error) && (
        <Snackbar open onClose={resetTransferOwnershipStatus}>
          <Alert
            onClose={resetTransferOwnershipStatus}
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
        <Snackbar open onClose={resetReconcilateStatus}>
          <Alert
            onClose={resetReconcilateStatus}
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
                onWithdraw={async () => await updateReconcilateStatus({
                  id: x?.litigation_id,
                  reconcilate: true,
                })}
                canAccept={!x?.toJudge ? x?.reconcilate === null : null}
                isDeclined={!x?.toJudge ? x?.reconcilate : null}
                // eslint-disable-next-line no-return-await
                onAccept={async () => await updateReconcilateStatus({
                  id: x?.litigation_id,
                  reconcilate: false,
                })}
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
