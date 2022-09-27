import {
  Chip,
  Grid,
  Typography,
} from '@mui/material';
import InvitationCardImg from '../../assets/invitation-card.png';
import LinkedinIcon from '../../assets/linkedin.png';
import EyeImage from '../../assets/eye.webp';
import UserImage1 from '../../assets/user-image-2.jpeg';
import LoadingImage from '../../assets/loading.png';
import './InvitationCard.css';

function InvitationCard() {
  return (
    <Grid container className="invitationCard">
      <Grid item md={6.5} xs={12}>
        <div className="invitationCardLeft">
          <div className="invitationCardLeftImage">
            <img src={InvitationCardImg} alt="" />
          </div>
          <div className="invitationCardLeftText">
            <Typography variant="h6">
              Pompeii
            </Typography>
            <Typography variant="span">
              https://www.youtube.com/watch?v=dbMk9vWqgpc
            </Typography>

            <div className="invitationCardLeftButton non-responsive">
              <Chip label="Creation preview" className="chipPreview" />
              <Chip label="Creation authorship pending" className="chipPending" />
            </div>
          </div>
          <div className="invitationCardLeftButton responsive">
            <Chip label="Creation preview" size="medium" className="Preview" avatar={<img alt="eye" src={EyeImage} />} style={{ paddingTop: 20, paddingBottom: 20, backgroundColor: 'lightblue' }} />
            <Chip label="Creation authorship pending" size="medium" color="warning" className="Pending" avatar={<img alt="eye" src={LoadingImage} style={{ width: 15, height: 15 }} width={5} height={5} />} style={{ padding: 15, height: 40 }} />
          </div>
        </div>
      </Grid>
      <Grid item md={5.5} xs={12}>
        <div className="invitationCardRight">
          <div className="invitationCardRightUser">
            <div className="postedImage">
              <img src={UserImage1} alt="" />

              <Typography variant="h6">
                Recognized By jack 58
              </Typography>
            </div>
            <div className="postedImageRight">
              <Typography variant="span">
                <img src={LinkedinIcon} alt="" />
                New poem for jack at 2022-01-01  00:00:00
              </Typography>
            </div>

          </div>
          <div className="invitationCardRightButton">
            <Chip label="Accept authorship" className="Accept" color="success" style={{ backgroundColor: 'lightgreen', padding: 20 }} />
            <Chip label="I'm not the author" className="Decline" color="error" style={{ padding: 20 }} />
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default InvitationCard;
