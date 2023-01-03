import {
  Alert, Button, Grid, Snackbar,
} from '@mui/material';
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.css';
import LitigationCard from 'components/cards/LitigationCard';
import authUser from 'utils/helpers/authUser';
import statusTypes from 'utils/constants/statusTypes';
import useHome from './useHome';

const user = authUser.getUser();

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
  const navigate = useNavigate();
  const [activeLitigation, setActiveLitigation] = useState('opening');
  const {
    isFetchingLitigations,
    litigations,
    fetchLitigations,
    isUpdatingLitigationStatus,
    updatedLitigationStatus,
    updateLitigationStatus,
    resetLitigationStatus,
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
      {isUpdatingLitigationStatus && <Loader withBackdrop size="large" />}
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
      {(updatedLitigationStatus.success || updatedLitigationStatus.error) && (
        <Snackbar open onClose={resetLitigationStatus}>
          <Alert
            onClose={resetLitigationStatus}
            severity={updatedLitigationStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {updatedLitigationStatus.success
              ? 'Litigation status updated!'
              : updatedLitigationStatus.error}
          </Alert>
        </Snackbar>
      )}
      <Grid container className="Litigation">
        <Grid display="flex" justifyContent="space-between" alignItems="center" width="100%">
          <Button onClick={redirectToCreateLitigation} className="btn btn-primary">
            + Claim your work
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
                  profileId: x?.issuer?.user_id,
                  name: x?.issuer?.user_name,
                  // eslint-disable-next-line unicorn/prefer-module
                  image: x?.issuer?.image_url || require('assets/images/profile-placeholder.png'),
                }}
                assumedAuthor={{
                  profileId: x?.issuer?.user_id,
                  name: x?.assumed_author?.user_name,
                  // eslint-disable-next-line unicorn/prefer-module
                  image: x?.assumed_author?.image_url || require('assets/images/profile-placeholder.png'),
                }}
                startDate={x?.litigation_start}
                endDate={x?.litigation_end}
                mode={
                  (activeLitigation === 'opening' && 'info')
                  || (activeLitigation === 'openedAgainstMe' && 'litigate')
                  || (activeLitigation === 'closed' && 'closed')
                  || (activeLitigation === 'toJudge' && 'toJudge')
                }
                notVoted={
                  x?.toJudge
                  && (x?.decisions?.length === 0
                  || !x?.decisions?.find((decision) => decision.maker_id === user.user_id))
                }
                votedInFavour={
                  x?.toJudge
                  && x?.decisions?.find(
                    (decision) => decision.maker_id === user.user_id
                    && decision.decision_status,
                  )
                }
                votedInOpposition={
                  x?.toJudge
                  && x?.decisions?.find(
                    (decision) => decision.maker_id === user.user_id
                    && !decision.decision_status,
                  )
                }
                totalJuryMembers={x?.recognitions?.length}
                canWithdraw={!x?.toJudge ? x?.litigation_status === statusTypes.PENDING : null}
                // eslint-disable-next-line no-return-await
                onWithdraw={async () => await updateLitigationStatus({
                  id: x?.litigation_id,
                  litigationStatus: statusTypes.WITHDRAWN,
                })}
                canAccept={!x?.toJudge ? x?.litigation_status === statusTypes.PENDING : null}
                isDeclined={!x?.toJudge ? x?.litigation_status === statusTypes.WITHDRAWN : null}
                // eslint-disable-next-line no-return-await
                onAccept={async () => await updateLitigationStatus({
                  id: x?.litigation_id,
                  litigationStatus: statusTypes.STARTED,
                })}
                canRedeem={!x?.toJudge
                  ? x?.winner?.user_id === user?.user_id : null}
                isRedeemed={!x?.toJudge ? x?.ownership_transferred : null}
                lostClaim={!x?.toJudge
                  ? x?.winner?.user_id !== user?.user_id : null}
                // eslint-disable-next-line no-return-await
                onRedeem={async () => await transferLitigatedItemOwnership(x?.litigation_id)}
                winner={{
                  profileId: x?.issuer?.user_id,
                  name: x?.winner?.user_name,
                  // eslint-disable-next-line unicorn/prefer-module
                  image: x?.winner?.image_url || require('assets/images/profile-placeholder.png'),
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
