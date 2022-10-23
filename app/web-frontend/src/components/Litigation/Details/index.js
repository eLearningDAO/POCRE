/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Box,
  Button, Chip, Grid,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LeftIcon from '../../../assets/left.png';
import RightIcon from '../../../assets/right.png';
import { ReactComponent as DislikeIcon } from '../../../assets/svgs/dislike.svg';
import { ReactComponent as LikeIcon } from '../../../assets/svgs/like.svg';
import { ReactComponent as ThumbPinIcon } from '../../../assets/svgs/thumb-pin.svg';
import MaterialCard from '../../cards/MaterialCard';
import UserCard from '../../cards/UserCard';
import Loader from '../../uicore/Loader';
import './index.css';
import useDetails from './useDetails';

export default function LitigationDetails() {
  const { id } = useParams();

  const {
    litigation,
    fetchLitigationDetails,
    fetchLitigationStatus,
    isFetchingLitigation,
    isCastingVote,
    castLitigationVote,
    voteStatusTypes,
  } = useDetails();

  useEffect(() => {
    if (id) fetchLitigationDetails(id);
  }, [id]);

  const [slideNumber, setSlideNumber] = useState(1);

  const next = () => {
    setSlideNumber((x) => (x === litigation?.invitations?.length ? 1 : x + 1));
  };
  const previous = () => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    setSlideNumber((x) => (x === 1 ? litigation?.invitations?.length - 1 : x - 1));
  };

  if (isFetchingLitigation) return <Loader />;

  if (fetchLitigationStatus.error) {
    return (
      <h2 className="color-red">
        {fetchLitigationStatus.error}
      </h2>
    );
  }

  return (
    <Grid item xs={12}>
      {isCastingVote && <Loader size="large" withBackdrop />}
      <Grid item xs={12}>
        <Typography className="litigationCloseTitle" variant="h6">
          Litigation -
          {' '}
          {litigation?.litigation_title}
        </Typography>
        {litigation?.litigation_description && (
        <Typography variant="h6">
          {litigation?.litigation_description}
        </Typography>
        )}
      </Grid>

      <Grid display="flex" justifyContent="space-between" alignItems="flex-start" marginTop="18px" width="100%">
        <Chip label={`STATUS: ${litigation?.status}`} className="bg-black color-white" />
        <Grid
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          alignItems="flex-end"
          gap="8px"
        >
          <Chip className="bg-orange color-white" label={`Starts on ${moment(litigation?.litigation_start).format('DD/MM/YYYY')}`} />
          <Chip className="bg-orange color-white" label={`Ends on ${moment(litigation?.litigation_end).format('DD/MM/YYYY')}`} />
        </Grid>
      </Grid>

      <Grid
        display="flex"
        alignItem="flex-top"
        gap="24px"
        padding="36px"
        className="secondary-section-container"
        marginTop="36px"
        width="100%"
      >
        <Grid display="flex" width="100%" flexDirection="column" gap="12px">
          <Typography className="inviationSectionTitle" variant="h6">
            Assumed Author
            {' '}
            {litigation?.isClosed && litigation?.winner?.wallet_address === litigation?.assumed_author?.wallet_address ? '(Winner)' : ''}
          </Typography>
          <UserCard
            username={litigation?.assumed_author?.user_name}
            imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`}
            totalCreationsAuthored={null}
            // eslint-disable-next-line jsx-a11y/aria-role
            role={litigation?.assumed_author?.wallet_address?.slice(1, 24)}
          />
        </Grid>
        <Grid display="flex" width="100%" flexDirection="column" gap="12px">
          <Typography className="inviationSectionTitle" variant="h6">
            Claimer
            {' '}
            {litigation?.isClosed && litigation?.winner?.wallet_address === litigation?.issuer?.wallet_address ? '(Winner)' : ''}
          </Typography>
          <UserCard
            username={litigation?.issuer?.user_name}
            imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`}
            totalCreationsAuthored={null}
            // eslint-disable-next-line jsx-a11y/aria-role
            role={litigation?.issuer?.wallet_address?.slice(1, 24)}
          />
        </Grid>
      </Grid>

      <Grid display="flex" marginTop="36px" width="100%">
        <MaterialCard
          mediaUrl={litigation?.material?.material_link || litigation?.creation?.source?.site_url}
          link={litigation?.material?.material_link || litigation?.creation?.source?.site_url}
          title={litigation?.material?.material_title || litigation?.creation?.creation_title}
          description={litigation?.material?.material_description
            || litigation?.creation?.creation_description}
          username={litigation?.assumed_author?.user_name}
          interactionBtns={false}
          showReconcilateOptions={false}
          recognitionStatus={
            litigation?.material && litigation?.material?.invite?.status?.status_name
              ? litigation?.material?.invite?.status?.status_name
              : null
            }
        />
      </Grid>
      <Grid
        display="flex"
        gap="48px"
        marginTop="24px"
        alignItems="center"
        justifyContent="flex-end"
        className="litigation-vote-container"
      >
        {
          litigation?.isJudging && !litigation?.isClosed
            ? (
              <>
                <Button
                  display="flex"
                  gap="4px"
                  className="vote-button"
                  alignItems="center"
                  style={{
                    backgroundColor: litigation.voteStatus === voteStatusTypes.AGREED ? 'var(--color-green)' : 'transparent',
                    color: litigation.voteStatus === voteStatusTypes.AGREED ? 'var(--color-white)' : 'var(--color-black)',
                  }}
                  // eslint-disable-next-line no-return-await
                  onClick={async () => await castLitigationVote(voteStatusTypes.AGREED)}
                >
                  <LikeIcon style={{
                    marginRight: '8px',
                    fill: litigation.voteStatus === voteStatusTypes.AGREED ? 'var(--color-white)' : 'var(--color-green)',
                  }}
                  />
                  Agree
                  {' '}
                  {litigation?.decisions?.filter((x) => x?.decision_status)?.length}
                </Button>
                <Button
                  display="flex"
                  gap="4px"
                  className="vote-button"
                  alignItems="center"
                  style={{
                    backgroundColor: litigation.voteStatus === voteStatusTypes.DISAGREED ? 'var(--color-red)' : 'transparent',
                    color: litigation.voteStatus === voteStatusTypes.DISAGREED ? 'var(--color-white)' : 'var(--color-black)',
                  }}
                  // eslint-disable-next-line no-return-await
                  onClick={async () => await castLitigationVote(voteStatusTypes.DISAGREED)}
                >
                  <DislikeIcon style={{
                    marginRight: '8px',
                    fill: litigation.voteStatus === voteStatusTypes.DISAGREED ? 'var(--color-white)' : 'var(--color-red)',
                  }}
                  />
                  Opposition
                  {' '}
                  {litigation?.decisions?.filter((x) => !x?.decision_status)?.length}
                </Button>
                <Button
                  display="flex"
                  gap="4px"
                  className="vote-button"
                  alignItems="center"
                  style={{
                    backgroundColor: litigation.voteStatus === voteStatusTypes.IMPARTIAL ? 'var(--color-purple)' : 'transparent',
                    color: litigation.voteStatus === voteStatusTypes.IMPARTIAL ? 'var(--color-white)' : 'var(--color-black)',
                  }}
                  // eslint-disable-next-line no-return-await
                  onClick={async () => await castLitigationVote(voteStatusTypes.IMPARTIAL)}
                >
                  <ThumbPinIcon style={{
                    marginRight: '8px',
                    fill: litigation.voteStatus === voteStatusTypes.IMPARTIAL ? 'var(--color-white)' : 'var(--color-purple)',
                  }}
                  />
                  Impartial
                  {' '}
                  {/* eslint-disable-next-line no-unsafe-optional-chaining */}
                  {litigation?.invitations?.length - litigation?.decisions?.length}
                </Button>
              </>
            )
            : (
              <>
        <Box display="flex" gap="4px" alignItems="center">
                  <LikeIcon style={{ marginRight: '8px' }} />
          Agree
          {' '}
          {litigation?.decisions?.filter((x) => x.decision_status)?.length}
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
                  <DislikeIcon style={{ marginRight: '8px' }} />
          Opposition
          {' '}
          {litigation?.decisions?.filter((x) => !x.decision_status)?.length}
        </Box>
        <Box display="flex" gap="4px" alignItems="center">
                  <ThumbPinIcon style={{ marginRight: '8px' }} />
          Impartial
          {' '}
          {/* eslint-disable-next-line no-unsafe-optional-chaining */}
          {litigation?.invitations?.length - litigation?.decisions?.length}
        </Box>
              </>
            )
        }
      </Grid>

      <Grid item xs={12} style={{ marginTop: '40px' }}>
        <Typography className="litigationCloseTitle" variant="h6">
          Invited jury members (
          {litigation?.invitations?.length}
          )
        </Typography>
      </Grid>

      <Grid
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItem="center"
        gap="24px"
        padding="36px"
        marginTop="16px"
        className="secondary-section-container"
      >
        <div className="carousel-container">
          {litigation?.invitations?.map(
            (invite, index) => (index === slideNumber - 1 || index === slideNumber
              ? (
                <UserCard
                  key={index}
                  username={invite?.invite_to?.user_name}
                  imageUrl={`https://i.pravatar.cc/50?img=${Math.random()}`}
                  totalCreationsAuthored={Math.floor(Math.random())}
                />
              )
              : null),
          )}
          <div className="carousel-slide-btns-container">
            <Button onClick={previous}>
              <img src={LeftIcon} alt="" />
            </Button>
            <Button onClick={next}>
              <img src={RightIcon} alt="" />
            </Button>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}
