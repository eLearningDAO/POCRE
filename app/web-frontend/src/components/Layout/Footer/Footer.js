import { Grid, Typography } from '@mui/material';
import TwitterIcon from '../../../assets/images/twitter2.png';
import GithubIcon from '../../../assets/svgs/github.svg';
import GlobeIcon from '../../../assets/images/globe.png';
import './Footer.css';

function Footer() {
  return (
    <Grid container width="100%" borderTop="1px solid #d5d1d1" marginTop="70px" paddingY="24px">
      <Grid item md={6} xs={9}>
        <Typography color="#32363C">Copyright © 2022 e-Learning DAO. Use and distribution are covered by AGPL-3.0</Typography>
      </Grid>
      <Grid item gap={2} md={6} xs={3} display="flex" justifyContent="flex-end" alignItems="center">
        <a href="https://twitter.com/eLearningDAO">
          <img src={TwitterIcon} alt="@eLearningDAO" />
        </a>
        <a href="https://github.com/e-Learning-DAO/POCRE">
          <img src={GithubIcon} alt="@eLearningDAO" width={30} height={30} />
        </a>
        <a href="https://www.pocre.net/">
          <img src={GlobeIcon} alt="@eLearningDAO" width={30} height={30} />
        </a>
      </Grid>
    </Grid>
  );
}

export default Footer;
