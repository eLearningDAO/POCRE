import { Chip, Grid, Typography } from "@mui/material";
import InvitationCardImg from '../../assets/invitation-card.png';
import UserImage1 from '../../assets/user-image-2.jpeg';

function InvitationCard() {
  return (
    <Grid container className="invitationCard">
      <Grid item md={6.5} xs={12}>
        <div className="invitationCardLeft">
          <div className="invitationCardLeftImage">
            <img src={InvitationCardImg} />
          </div>
          <div className="invitationCardLeftText">
            <Typography variant='h6'>
              Pompeii
            </Typography>
            <Typography variant='span'>
              https://www.youtube.com/watch?v=dbMk9vWqgpc
            </Typography>

            <div className="invitationCardLeftButton non-responsive">
              <Chip label='Preview' className='chipPreview' />
              <Chip label='Pending' className='chipPending'  />
            </div>
          </div>
          <div className="invitationCardLeftButton responsive">
            <Chip label='Preview' className='chipPreview' />
            <Chip label='Pending' className='chipPending'  />
          </div>
        </div>
      </Grid>
      <Grid item md={5.5} xs={12}>
        <div className="invitationCardRight">
          <div className="invitationCardRightUser">
            <div className="postedImage">
              <img src={UserImage1} />

              <Typography variant='h6'>
                Posted By jack 58
              </Typography>
            </div>

            <div className="postedImageRight">
              <Typography variant='span'>
                New poem for jack at 2022-01-01  00:00:00 
              </Typography>
            </div>

          </div>
          <div className="invitationCardRightButton">
            <Chip label='Accept' className='acceptButton' />
            <Chip label='Decline' className='declineButton'  />
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default InvitationCard;