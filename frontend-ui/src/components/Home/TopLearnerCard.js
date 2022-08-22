import { Grid, Typography } from "@mui/material";
import TopLearnerImg1 from '../../assets/top-learner-user.png';

function TopLearnerCard(props) {

  return (
    <Grid container className="invitationCard topLearnerCard">
      <Grid item xs={12}>
        <div className="invitationCardLeft topLearnerCardLeft">
          <div className="invitationCardLeftImage topLearnerCardLeftImage">
            <img alt='course-card' width='50' src={TopLearnerImg1} />
          </div>
          <div className="invitationCardLeftText topLearnerCardLeftText">
            <Typography variant='h6'>
              John Smith
            </Typography>
            <Typography variant='span'>
              esther@gmail.com
            </Typography>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default TopLearnerCard;