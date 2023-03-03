/* eslint-disable sonarjs/no-all-duplicated-branches */
import {
  Box,
  Button, Chip, Grid,
  Typography,
} from '@mui/material';
import LeftIcon from 'assets/images/left.png';
import RightIcon from 'assets/images/right.png';
import { ReactComponent as DislikeIcon } from 'assets/svgs/dislike.svg';
import { ReactComponent as LikeIcon } from 'assets/svgs/like.svg';
import { ReactComponent as ThumbPinIcon } from 'assets/svgs/thumb-pin.svg';
import MaterialCard from 'components/cards/MaterialCard';
import UserCard from 'components/cards/UserCard';
import Loader from 'components/uicore/Loader';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import statusTypes from 'utils/constants/statusTypes';
import './index.css';
import useDetails from './useDetails';

function VoteButton({
  onClick,
  label,
  type, // agree, disagree, impartial,
  isActive,
}) {
  const icons = {
    agree: LikeIcon,
    disagree: DislikeIcon,
    impartial: ThumbPinIcon,
  };
  const colors = {
    agree: 'green',
    disagree: 'red',
    impartial: 'purple',
  };
  const DerivedIcon = icons[type];
  const color = colors[type];

  return (
    <Button
      display="flex"
      gap="4px"
      className="vote-button"
      alignItems="center"
      style={{
        backgroundColor: isActive ? `var(--color-${color})` : 'transparent',
        color: isActive ? 'var(--color-white)' : 'var(--color-black)',
      }}
      onClick={onClick}
    >
      <DerivedIcon style={{
        marginRight: '8px',
        fill: isActive ? 'var(--color-white)' : `var(--color-${color})`,
      }}
      />
      {label}
    </Button>
  );
}

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
    user,
  } = useDetails();

  useEffect(() => {
    if (id) fetchLitigationDetails(id);
  }, [id]);

  const [slideNumber, setSlideNumber] = useState(1);

  const next = () => {
    setSlideNumber((x) => (x === litigation?.recognitions?.length ? 1 : x + 1));
  };
  const previous = () => {
    // eslint-disable-next-line no-unsafe-optional-chaining
    setSlideNumber((x) => (x === 1 ? litigation?.recognitions?.length - 1 : x - 1));
  };

  if (isFetchingLitigation) return <Loader />;

  if (fetchLitigationStatus.error) {
    return (
      <h2 className="color-red">
        {fetchLitigationStatus.error}
      </h2>
    );
  }

  const alreadyVoted = litigation?.decisions?.find((x) => x?.maker_id === user?.user_id);

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
        <Chip label={`${litigation?.status}`} className="bg-black color-white" />
        {!litigation.is_draft && (
          <Grid
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
            alignItems="flex-end"
            gap="8px"
          >
            <Chip className="bg-orange color-white" label={`Starts on ${litigation?.start_date}`} />
            <Chip className="bg-orange color-white" label={`Ends on ${litigation?.end_date}`} />
          </Grid>
        )}
      </Grid>

      <Grid
        display="flex"
        alignItems="flex-top"
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
            {litigation?.isClosed && litigation?.winner?.user_id === litigation?.assumed_author?.user_id ? '(Winner)' : ''}
          </Typography>
          <UserCard
            userProfileId={litigation?.assumed_author?.user_id}
            username={litigation?.assumed_author?.user_name}
            role={litigation?.assumed_author?.user_bio}
            // eslint-disable-next-line unicorn/prefer-module
            imageUrl={litigation?.assumed_author?.image_url || require('assets/images/profile-placeholder.png')}
            totalCreationsAuthored={null}
          />
        </Grid>
        <Grid display="flex" width="100%" flexDirection="column" gap="12px">
          <Typography className="inviationSectionTitle" variant="h6">
            Claimer
            {' '}
            {litigation?.isClosed && litigation?.winner?.user_id === litigation?.issuer?.user_id ? '(Winner)' : ''}
          </Typography>
          <UserCard
            userProfileId={litigation?.issuer?.user_id}
            username={litigation?.issuer?.user_name}
            role={litigation?.issuer?.user_bio}
            // eslint-disable-next-line unicorn/prefer-module
            imageUrl={litigation?.issuer?.image_url || require('assets/images/profile-placeholder.png')}
            totalCreationsAuthored={null}
          />
        </Grid>
      </Grid>

      <Grid display="flex" marginTop="36px" width="100%">
        <MaterialCard
          mediaUrl={litigation?.material?.material_link || litigation?.creation?.creation_link}
          mediaType={litigation?.material?.material_type || litigation?.creation?.creation_type}
          link={litigation?.material?.material_link || litigation?.creation?.creation_link}
          title={litigation?.material?.material_title || litigation?.creation?.creation_title}
          description={litigation?.material?.material_description
            || litigation?.creation?.creation_description}
          username={litigation?.assumed_author?.user_name}
          userProfileId={litigation?.assumed_author?.user_id}
          interactionBtns={false}
          showReconcilateOptions={false}
          recognitionStatus={
            litigation?.material && litigation?.material?.recognition?.status?.status_name
              ? litigation?.material?.recognition?.status?.status_name
              : statusTypes.ACCEPTED
          }
        />
      </Grid>

      {/* if there are judges */}
      {litigation?.recognitions?.length > 0 && (
        <>
          <Grid
            display="flex"
            gap="48px"
            marginTop="24px"
            alignItems="center"
            justifyContent="flex-end"
            className="litigation-vote-container"
          >
            {
              (
                litigation?.isJudging
                && !litigation?.isClosed
                && !alreadyVoted
                && litigation?.assumed_author_response === statusTypes.START_LITIGATION
              )
                ? (
                  <>
                    <VoteButton
                      isActive={litigation.voteStatus === voteStatusTypes.AGREED}
                      // eslint-disable-next-line no-return-await
                      onClick={async () => await castLitigationVote(voteStatusTypes.AGREED)}
                      type="agree"
                      label={`Agree 
                      (${litigation?.decisions
                        ? litigation?.decisions?.filter((x) => x?.decision_status)?.length
                        : '0'})`}
                    />
                    <VoteButton
                      isActive={litigation.voteStatus === voteStatusTypes.DISAGREED}
                      // eslint-disable-next-line no-return-await
                      onClick={async () => await castLitigationVote(voteStatusTypes.DISAGREED)}
                      type="disagree"
                      label={`Opposition 
                      (${litigation?.decisions
                        ? litigation?.decisions?.filter((x) => !x?.decision_status)?.length
                        : '0'})`}
                    />
                    <VoteButton
                      isActive={litigation.voteStatus === voteStatusTypes.IMPARTIAL}
                      // eslint-disable-next-line no-return-await
                      onClick={async () => await castLitigationVote(voteStatusTypes.IMPARTIAL)}
                      type="impartial"
                      label={`Impartial 
                      (${litigation?.decisions && litigation?.recognitions
                        ? (litigation?.recognitions?.length - litigation?.decisions?.length)
                        : '0'})`}
                    />
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
                      {(litigation?.recognitions?.length - litigation?.decisions?.length) || 0}
                    </Box>
                  </>
                )
            }
          </Grid>

          <Grid item xs={12} style={{ marginTop: '40px' }}>
            <Typography className="litigationCloseTitle" variant="h6">
              Recognized jury members (
              {litigation?.recognitions?.length}
              )
            </Typography>
          </Grid>

          <Grid
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            gap="24px"
            padding="36px"
            marginTop="16px"
            className="secondary-section-container"
          >
            <div className="carousel-container">
              <div className="carousel-container-cards">
                {litigation?.recognitions?.map(
                  (recognition, index) => (index === slideNumber - 1 || index === slideNumber
                    ? (
                      <UserCard
                        key={index}
                        // eslint-disable-next-line jsx-a11y/aria-role
                        role={(() => {
                          const vote = litigation?.decisions?.find(
                            (x) => x?.maker_id === recognition?.recognition_for?.user_id,
                          )?.decision_status;

                          return vote === false ? 'Voted in opposition' : (vote === true ? 'Voted in favor' : 'Vote not casted');
                        })()}
                        userProfileId={recognition?.recognition_for?.user_id}
                        username={recognition?.recognition_for?.user_name}
                        // eslint-disable-next-line unicorn/prefer-module
                        imageUrl={recognition?.recognition_for?.image_url || require('assets/images/profile-placeholder.png')}
                        totalCreationsAuthored={Math.floor(Math.random())}
                      />
                    )
                    : null),
                )}
              </div>
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
        </>
      )}

    </Grid>
  );
}
