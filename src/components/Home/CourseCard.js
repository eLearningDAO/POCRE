import { Button, Grid, Typography } from "@mui/material";
import CourseCard1 from '../../assets/course-card1.png';

function CourseCard(props) {

  return (
    <Grid container className="invitationCard courseCard">
      <Grid item xs={12}>
        <div className="invitationCardLeft courseCardLeft">
          <div className="invitationCardLeftImage courseCardLeftImage">
            <img alt='course-card' width='180' src={CourseCard1} />
          </div>
          <div className="invitationCardLeftText courseCardLeftText">
            <Typography variant='h6'>
                Flutter building
            </Typography>
            <Typography variant='span'>
                1000+ free files you deliver real-time metrics for actionalble results.
            </Typography>

            <Button>Enroll Course</Button>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default CourseCard;