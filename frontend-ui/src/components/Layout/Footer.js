import { Grid } from "@mui/material";
import FacebookIcon from '../../assets/facebook2.png';
import InstagramIcon from '../../assets/instagram2.png';
import YoutubeIcon from '../../assets/youtube2.png';
import TwitterIcon from '../../assets/twitter2.png';
import LinkedinIcon from '../../assets/linkedin2.png';

function Footer() {
  return ( 
    <Grid container className="footerSection">
      <Grid item md={6} xs={12} sm={12}>
        <p className="footerText">Copyright © 2022. Decentralized e-learning. All Rights Reserved</p>
      </Grid>
      <Grid item md={6} xs={12} sm={12} className="socialIcons">
        <div className='creditCardIcons'>
          <img src={FacebookIcon} />
          <img src={TwitterIcon} />
          <img src={LinkedinIcon} />
          <img src={InstagramIcon} />
          <img src={YoutubeIcon} />
        </div>
      </Grid>
    </Grid>
  );
}

export default Footer;