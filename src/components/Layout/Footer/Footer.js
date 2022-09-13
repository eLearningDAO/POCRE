import { Grid } from "@mui/material";
import TwitterIcon from '../../../assets/twitter2.png';
import "./Footer.css"

function Footer() {
  return ( 
    <Grid container className="footerSection">
      <Grid item md={6} xs={12} sm={12}>
        <p className="footerText">Copyright © 2022. Decentralized e-Learning DAO. All Rights Reserved</p>
      </Grid>
      <Grid item md={6} xs={12} sm={12} className="socialIcons">
        <div className='creditCardIcons'>
          <img src={TwitterIcon} alt="" />
        </div>
      </Grid>
    </Grid>
  );
}

export default Footer;