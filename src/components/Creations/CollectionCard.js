import { Grid, Typography } from "@mui/material";
import CommentIcon from '../../assets/comment.png';
import CreationCardImg from '../../assets/creation-card.png';
import DislikeIcon from '../../assets/dislike.png';
import DownloadIcon from '../../assets/download.png';
import LikeIcon from '../../assets/like.png';
import PencilIcon from '../../assets/pencil.png';
import ShareIcon from '../../assets/share.png';
import UserImage1 from '../../assets/top-learner-user.png';
import UserImage2 from '../../assets/user-image-2.jpeg';

function CollectionCard(props) {
  const { interactionBtns } = props;

  console.log(interactionBtns);

  return (
    <Grid container className="invitationCard collectionCard">

      <Grid item md={interactionBtns? 4 : 5} sm={12}>
        <div className="invitationCardLeft collectionCardLeft">
          <div className="invitationCardLeftImage collectionCardLeftImage">
            <img alt='collection-card' width='130' src={CreationCardImg} />
          </div>
          <div className="invitationCardLeftText collectionCardLeftText">
            <Typography variant='h6'>
              Mobile App Design
            </Typography>
            <Typography variant='span'>
              1000+ free files you can duplicate,
              remix, and reuse
            </Typography>
          </div>
        </div>
      </Grid>

      <Grid item md={interactionBtns? 3 : 4} sm={12}>
        <div className="invitationCardLeft collectionCardLeft">
          <div className="invitationCardLeftButton collectionFollowerImages">
            <div className="collectionFollowerImages">
              <img src={UserImage1} alt=""/>
              <img src={UserImage2} alt=""/>
              <img src={UserImage1} alt=""/>
              <img src={UserImage2} alt=""/>
              <img src={UserImage1} alt=""/>
              <img src={UserImage2} alt=""/>
            </div>
            <div className="socialIcons">
              <div className="socialIcon active">
                <img src={LikeIcon} alt=""/> <span>100K</span>
              </div>
              <div className="socialIcon">
                <img src={DislikeIcon} alt=""/> <span>30K</span>
              </div>
              <div className="socialIcon">
                <img src={CommentIcon} alt=""/> <span>5K</span>
              </div>
            </div>
          </div>
        </div>
      </Grid>

      <Grid item md={interactionBtns? 2 : 3} sm={12}>
        <div className="invitationCardLeft collectionCardLeft">
          <div className="invitationCardRightUser collectionFollowerDateCreated">
            <Typography variant='h6'>
              Date Created
            </Typography>
            <Typography variant='span'>
              2022-01-01 00:00:00
            </Typography>
          </div>
        </div>
      </Grid>

      <Grid item md={interactionBtns? 3 : 0} sm={12}>
        <div className="invitationCardRight">
          {interactionBtns && (
            <div className="invitationCardRightButton collectionRightButton">
              <img src={PencilIcon} alt=""/>
              <img src={DownloadIcon} alt=""/>
              <img src={ShareIcon} alt=""/>
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
}

export default CollectionCard;