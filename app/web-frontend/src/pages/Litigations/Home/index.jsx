import {
  Alert, Button, Grid, Snackbar,
} from '@mui/material';
import LitigationCard from 'components/cards/LitigationCard';
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import statusTypes from 'utils/constants/statusTypes';
import transactionPurposes from 'utils/constants/transactionPurposes';
import authUser from 'utils/helpers/authUser';
import './index.css';
import useHome from '../../../hydraDemo/hooks/useHome';

const litigationToTransactionPurpose = {
  inReconcilation: transactionPurposes.START_LITIGATION,
  toVote: transactionPurposes.CAST_LITIGATION_VOTE,
  closed: transactionPurposes.REDEEM_LITIGATED_ITEM,
};

function Litigation() {
  // get userInfo from the globale state with help of zustand store hook !
  // const user = useUserInfo((s) => s.user);
  const user = authUser.getUser();
  const navigate = useNavigate();
  const [activeLitigation, setActiveLitigation] = useState('inDraft');
  const {
    isFetchingLitigations,
    litigations,
    fetchLitigations,
    isUpdatingAssumedAuthorResponse,
    updatedAssumedAuthorResponseStatus,
    updateAssumedAuthorResponse,
    resetAssumedAuthorResponseStatus,
    isTransferringOwnership,
    transferOwnershipStatus,
    resetTransferOwnershipStatus,
    transferLitigatedItemOwnership,
  } = useHome();

  useEffect(() => {
    fetchLitigations();
  }, [user?.user_id]);

  const redirectToCreateLitigation = () => {
    navigate('/litigations/create');
  };

  const redirectToUpdateLitigation = (id, materialId) => {
    navigate(`/litigations/${id}/update?materialId=${materialId}`);
  };

  if (isFetchingLitigations) return <Loader />;

  return (
    <>
      {isTransferringOwnership && <Loader withBackdrop size="large" />}
      {isUpdatingAssumedAuthorResponse && <Loader withBackdrop size="large" />}
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
      {(updatedAssumedAuthorResponseStatus.success || updatedAssumedAuthorResponseStatus.error) && (
        <Snackbar open onClose={resetAssumedAuthorResponseStatus}>
          <Alert
            onClose={resetAssumedAuthorResponseStatus}
            severity={updatedAssumedAuthorResponseStatus.success ? 'success' : 'error'}
            sx={{ width: '100%' }}
          >
            {updatedAssumedAuthorResponseStatus.success
              ? 'Litigation status updated!'
              : updatedAssumedAuthorResponseStatus.error}
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
            className={`btn ${activeLitigation === 'inDraft' && 'btn-active'}`}
            onClick={() => setActiveLitigation('inDraft')}
          >
            In draft (
            {litigations?.inDraft?.length}
            )
          </Button>
          <Button
            className={`btn ${activeLitigation === 'inReconcilation' && 'btn-active'}`}
            onClick={() => setActiveLitigation('inReconcilation')}
          >
            In reconcilation (
            {litigations?.inReconcilation?.length}
            )
          </Button>
          <Button
            className={`btn ${activeLitigation === 'inVoting' && 'btn-active'}`}
            onClick={() => setActiveLitigation('inVoting')}
          >
            In voting (
            {litigations?.inVoting?.length}
            )
          </Button>
          <Button
            className={`btn ${activeLitigation === 'toVote' && 'btn-active'}`}
            onClick={() => setActiveLitigation('toVote')}
          >
            To vote (
            {litigations?.toVote?.length}
            )
          </Button>
          <Button
            className={`btn ${activeLitigation === 'closed' && 'btn-active'}`}
            onClick={() => setActiveLitigation('closed')}
          >
            Closed (
            {litigations?.closed?.length}
            )
          </Button>
        </div>

        {litigations?.[activeLitigation]?.length > 0 ? (
          <div className="grid-container">
            {litigations?.[activeLitigation]?.map((x, index) => (
              <LitigationCard
                key={index}
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
                {...(activeLitigation === 'inDraft' && {
                  mode: 'drafted',
                  onUpdate: () => redirectToUpdateLitigation(x?.litigation_id, x?.material_id),
                })}
                {...(activeLitigation === 'inVoting' && {
                  mode: 'info',
                })}
                {...(activeLitigation === 'inReconcilation' && {
                  startDate: x?.reconcilation_start,
                  endDate: x?.reconcilation_end,
                  mode: 'info',
                  ...(user?.user_id === x?.assumed_author?.user_id && {
                    mode: 'litigate',
                    canWithdraw: x?.assumed_author_response === statusTypes.PENDING_RESPONSE,
                    // eslint-disable-next-line no-return-await
                    onWithdraw: async () => await updateAssumedAuthorResponse({
                      id: x?.litigation_id,
                      assumedAuthorResponse: statusTypes.WITHDRAW_CLAIM,
                    }),
                    canAccept: x?.assumed_author_response === statusTypes.PENDING_RESPONSE,
                    // eslint-disable-next-line no-return-await
                    onAccept: async () => await updateAssumedAuthorResponse({
                      id: x?.litigation_id,
                      assumedAuthorResponse: statusTypes.START_LITIGATION,
                    }),
                    isDeclined: x?.assumed_author_response === statusTypes.WITHDRAW_CLAIM,
                  }),
                })}
                {...(activeLitigation === 'closed' && {
                  mode: 'closed',
                  startDate: x?.reconcilation_start,
                  endDate: x?.voting_end,
                  winner: {
                    profileId: x?.winner?.user_id,
                    name: x?.winner?.user_name,
                    // eslint-disable-next-line unicorn/prefer-module
                    image: x?.winner?.image_url || require('assets/images/profile-placeholder.png'),
                  },
                  canRedeem: x?.winner?.user_id === user?.user_id ? true : null,
                  // eslint-disable-next-line no-return-await
                  onRedeem: async () => await transferLitigatedItemOwnership(x?.litigation_id),
                  isRedeemed: x?.winner?.user_id === user?.user_id
                    ? x?.ownership_transferred : null,
                  lostClaim: x?.winner?.user_id !== user?.user_id,
                })}
                {...(activeLitigation === 'toVote' && {
                  mode: 'toJudge',
                  notVoted: (x?.decisions?.length === 0
                    || !x?.decisions?.find((decision) => decision.maker_id === user.user_id)),
                  votedInFavour: x?.decisions?.find(
                    (decision) => decision.maker_id === user.user_id
                      && decision.decision_status,
                  ),
                  votedInOpposition: x?.decisions?.find(
                    (decision) => decision.maker_id === user.user_id
                      && !decision.decision_status,
                  ),
                })}
                {...(['inVoting', 'toVote'].includes(activeLitigation) && {
                  startDate: x?.voting_start,
                  endDate: x?.voting_end,
                })}
                {...(['inVoting', 'toVote', 'closed'].includes(activeLitigation) && {
                  totalJuryMembers: x?.recognitions?.length,
                })}
                isPendingPaymentConfirmation={
                  (x?.transactions || []).find(
                    (y) => (
                      y?.transaction_purpose === litigationToTransactionPurpose[activeLitigation]
                      && !y?.is_validated
                    ),
                  )
                }
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
