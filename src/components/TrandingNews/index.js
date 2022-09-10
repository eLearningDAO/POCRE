import { Grid, Typography } from "@mui/material";
import TrandingNewsImage from "../../assets/TrandingNewsImage.png";
import PencilIcon from '../../assets/pencil.png';
import DownloadIcon from '../../assets/download.png';
import ShareIcon from '../../assets/share.png';

function TrandingNews() {
  return (
    <Grid container>
      <Grid item xs={12} className='trandingNewsHeader'>
        <Typography variant="h5" >Trending News</Typography>
      </Grid>

      <Grid item xs={12}>
        <div className="trandingNewsCard">
          <div className="trandingNewsCardImage">
            <img alt="trending-news-img" src={TrandingNewsImage} />
          </div>

          <div className="trandingNewsCardText">
            <div className="trandingNewsCardTextHeader">
              <div className="trandingNewsCardTextTitle">
                <Typography variant="h6">The biggest misconceptions about bitcoin</Typography>


                <div className="invitationCardRightButton collectionRightButton trendingNewsRightButton responsive">
                  <img src={PencilIcon} />
                  <img src={DownloadIcon} />
                  <img src={ShareIcon} />
                </div>
              </div>

              <Typography className="trandingNewsCardTextTime"><span>Yahoo Finance </span>- 10 Hours ago</Typography>
            </div>

            <div className="trandingNewsCardTextParagraph">
              <p>
                Deliver real-time metrics for actionalble results. Amet minim mollit non deserunt ullamco est sit aliqu dolor do amet sint. Velit officia consequat duis enim velit mollit. Exercitation veniam consequat sunt nostru amet mollit non deserunt ullamco est sit. Read More
              </p>
            </div>
            <div className="invitationCardRightButton collectionRightButton trendingNewsRightButton non-responsive">
              <img src={PencilIcon} />
              <img src={DownloadIcon} />
              <img src={ShareIcon} />
            </div>
          </div>
        </div>
      </Grid>
    </Grid>
  );
}

export default TrandingNews;