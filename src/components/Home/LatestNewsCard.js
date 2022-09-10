import { Grid, Typography } from "@mui/material";
import LatestNewsCardImg from '../../assets/latest-news-card.png';

function LatestNewsCard(props) {

  return (
    <Grid container className="invitationCard latestNewsCard">
      <Grid item xs={12}>
        <div className="invitationCardLeft latestNewsCardLeft">
          <div className="invitationCardLeftImage latestNewsCardLeftImage">
            <img alt='course-card' width='150' src={LatestNewsCardImg} />
          </div>
          <div className="invitationCardLeftText latestNewsCardLeftText">
            <Typography variant='h6'>
                Amet minim mollit non 
            </Typography>
            <Typography variant='span'>
                May 15, 2022
            </Typography>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default LatestNewsCard;