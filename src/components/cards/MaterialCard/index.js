import {
  Box, Button, Grid, Typography,
} from '@mui/material';
import CreationCardImg from '../../../assets/creation-card.png';
import PencilIcon from '../../../assets/pencil.png';
import CheckMarkIcon from '../../../assets/svgs/checkmark.svg';
import DeleteIcon from '../../../assets/svgs/delete.svg';
import EyeOffIcon from '../../../assets/svgs/eye-off.svg';
import PendingIcon from '../../../assets/svgs/pending.svg';
import RequestAcceptFilledIcon from '../../../assets/svgs/request-accept-filled.svg';
import RequestAcceptOutlinedIcon from '../../../assets/svgs/request-accept-outlined.svg';
import RequestDeclineFilledIcon from '../../../assets/svgs/request-decline-filled.svg';
import RequestDeclineOutlinedIcon from '../../../assets/svgs/request-decline-outlined.svg';
import './index.css';

function MaterialCard({
  interactionBtns,
  requestAccepted = true,
  username = 'jack 50',
  link = 'https://www.youtube.com/watch?v=2BjYPFBh4Zc',
  title = 'Mobile App Design',
  imageUrl = CreationCardImg,
  onDeleteClick = () => {},
  onEditClick = () => {},
  canHide = true,
  canEdit = true,
  canDelete = true,
  canAccept = true,
  canDecline = true,
}) {
  return (
    <Grid
      container
      className="material-card"
      gap={{
        xs: '24px',
        md: '32px',
      }}
      maxWidth={{ xs: '300px', sm: '400px', md: '100%' }}
      minWidth={{ xs: '300px', sm: '400px', md: '100%' }}
      flexWrap={{ md: 'nowrap' }}
    >

      <Grid
        item
        xs={12}
        md={6}
        display="flex"
        marginTop="auto"
        marginBottom="auto"
        flexDirection={{ xs: 'column', lg: 'row' }}
        gap={{ xs: '12px', sm: '12px', md: '16px' }}
        height="fit-content"
      >
        <img className="material-card-image" alt="material-card-hero" src={imageUrl} />
        <Box
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          {title && (
          <Typography variant="h6" fontSize={{ xs: '18px', lg: '24px' }} marginBottom="5px" style={{ wordBreak: 'break-word' }}>
            {title}
          </Typography>
          )}
          {link && (
          <Typography variant="a" component="a" href={link} style={{ wordBreak: 'break-word' }}>
            {link}
          </Typography>
          )}
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={interactionBtns && (canEdit || canDelete || canHide) ? 5 : 6}
        display="flex"
        flexDirection={{ xs: 'column', xl: 'row' }}
        justifyContent="center"
        alignItems="center"
        gap={{ xs: '12px', sm: '12px', md: '16px' }}
        borderLeft={{ md: '1px solid #EEF0F3' }}
        paddingLeft={{ md: '12px' }}
        borderRight={{ md: interactionBtns && (canEdit || canDelete || canHide) ? '1px solid #EEF0F3' : '' }}
        paddingRight={{ md: interactionBtns && (canEdit || canDelete || canHide) ? '12px' : '' }}
      >

        <Grid display="flex" gap="12px" alignItems="center">
          <img
            className="material-card-avatar"
            alt="avatar"
            src={`https://i.pravatar.cc/50?img=${Math.random()}`}
          />
          <span>
            By
            {' '}
            {username}
          </span>
        </Grid>

        <Grid display="flex" gap="12px" flexWrap={{ md: 'wrap', lg: 'initial' }} justifyContent={{ md: 'center', lg: 'initial' }}>
          <Button className={requestAccepted ? 'approveButton' : 'pendingButton'}>
            <img src={requestAccepted ? CheckMarkIcon : PendingIcon} alt={requestAccepted ? 'accept-btn' : 'decline-btn'} />
            {requestAccepted ? 'Approve' : 'Pending'}
          </Button>

          <Grid display="flex" gap="12px" alignItems="center">
            {canAccept && (
            <Button className={`material-card-action-btn ${requestAccepted ? 'bg-green' : 'bg-green-20'}`}>
              {requestAccepted ? <img src={RequestAcceptFilledIcon} alt="accept" />
                : <img src={RequestAcceptOutlinedIcon} alt="accept" />}
            </Button>
            )}
            {canDecline && (
            <Button className={`material-card-action-btn ${!requestAccepted ? 'bg-red' : 'bg-red-20'}`}>
              {!requestAccepted ? <img src={RequestDeclineFilledIcon} alt="decline" />
                : <img src={RequestDeclineOutlinedIcon} alt="decline" />}
            </Button>
            )}
          </Grid>
        </Grid>
      </Grid>

      {interactionBtns && (canEdit || canDelete || canHide) && (
      <Grid item md={1} xs={12} margin="auto" display="flex" justifyContent="center" alignItems="center">
        <Grid display="flex" flexDirection={{ xs: 'row', md: 'column' }} justifyContent="space-between" maxWidth="200px" margin={{ xs: 'auto', sm: '0' }} alignItems="center" gap={{ xs: '12px', md: '16px' }}>
          {canHide && (
          <Button className="material-card-action-btn material-card-action-btn-gray">
            <img src={EyeOffIcon} alt="" />
          </Button>
          )}
          {canEdit && (
          <Button className="material-card-action-btn material-card-action-btn-gray" onClick={onEditClick}>
            <img src={PencilIcon} alt="" />
          </Button>
          )}
          {canDelete && (
          <Button className="material-card-action-btn material-card-action-btn-gray" onClick={onDeleteClick}>
            <img src={DeleteIcon} alt="" />
          </Button>
          )}
        </Grid>
      </Grid>
      )}
    </Grid>
  );
}

export default MaterialCard;
