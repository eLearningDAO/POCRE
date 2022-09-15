import { Box, Button, Grid, Typography } from "@mui/material";
import CommentIcon from '../../../assets/comment.png';
import CreationCardImg from '../../../assets/creation-card.png';
import DislikeIcon from '../../../assets/dislike.png';
import DownloadIcon from '../../../assets/download.png';
import LikeIcon from '../../../assets/like.png';
import PencilIcon from '../../../assets/pencil.png';
import ShareIcon from '../../../assets/share.png';
import UserImage1 from '../../../assets/top-learner-user.png';
import UserImage2 from '../../../assets/user-image-2.jpeg';
import "./CollectionCard.css"

function CollectionCard(props) {
  const { interactionBtns } = props;

  return (
    <Grid container className="collection-card"
      gap={{ xs: '24px', md: "32px" }}
      maxWidth={{ xs: '300px', sm: '400px', md: '100%' }}
      flexWrap={{md: "nowrap"}}
      >

      <Grid item xs={12} md={6} lg={7}  display="flex" flexDirection={{ xs: 'column', lg: 'row' }} gap={{ xs: '12px', sm: '12px', md: '16px' }}
        height={'fit-content'}
      >
        <img className="collection-card-image" alt='collection-card-hero' src={CreationCardImg} />
        <Box alignItems='flex-start' display="flex" flexDirection='column' 
        justifyContent="center"
        >
          <Typography variant='h6' fontSize={{ xs: '18px', lg: "24px" }} marginBottom="5px">
            Mobile App Design
          </Typography>
          <Typography variant='p' component='p'>
            1000+ free files you can duplicate, remix, and reuse 1000+ free files
          </Typography>
        </Box>
      </Grid>

      <Grid item  xs={12} md={interactionBtns ? 5 : 6} lg={interactionBtns ? 4 : 5} display="flex" flexDirection='column' gap={{ xs: '12px', sm: '12px', md: '16px' }}
        borderLeft={{ md: '1px solid #EEF0F3' }} paddingLeft={{ md: '12px' }}
        borderRight={{ md: interactionBtns ? '1px solid #EEF0F3' : '' }} paddingRight={{ md: interactionBtns ? '12px' : '' }}
      >
        <div className="collection-member-images">
          <img src={UserImage1} alt="" />
          <img src={UserImage2} alt="" />
          <img src={UserImage1} alt="" />
          <img src={UserImage2} alt="" />
          <img src={UserImage1} alt="" />
          <img src={UserImage2} alt="" />
        </div>
        <Grid display="flex" justifyContent="space-between" maxWidth={"200px"} margin={{ xs: 'auto', sm: '0' }} alignItems="center" gap={{ xs: '10px', lg: '16px' }} >
          <Box display="flex" alignItems="center" gap="5px" className="collection-social-icon active">
            <img src={LikeIcon} alt="" /> <span>100K</span>
          </Box>
          <Box display="flex" alignItems="center" gap="5px" className="collection-social-icon">
            <img src={DislikeIcon} alt="" /> <span>30K</span>
          </Box>
          <Box display="flex" alignItems="center" gap="5px" className="collection-social-icon">
            <img src={CommentIcon} alt="" /> <span>5K</span>
          </Box>
        </Grid>
        <Box alignItems='flex-start' display="flex" flexDirection='column' justifyContent="center">
          <Typography variant='h6' fontSize={{ xs: '16px', lg: "18px" }} marginBottom="5px">
            Date Created
          </Typography>
          <Typography variant='p' fontSize={{ xs: '14px', lg: "16px" }} >
            2022-01-01 00:00:00
          </Typography>
        </Box>
      </Grid>

      {interactionBtns && <Grid item md={1} xs={12}>
        <Grid display="flex" flexDirection={{ xs: 'row', md: 'column', xl: 'arow' }} justifyContent="space-between" maxWidth={"200px"} margin={{ xs: 'auto', sm: '0' }} alignItems="center" gap={{ xs: '12px', md: '16px' }} >
          <Button className="collection-card-action-btn">
            <img src={PencilIcon} alt="" />
          </Button>
          <Button className="collection-card-action-btn">
            <img src={DownloadIcon} alt="" />
          </Button>
          <Button className="collection-card-action-btn">
            <img src={ShareIcon} alt="" />
          </Button>
        </Grid>
      </Grid>}
    </Grid>
  );
}

export default CollectionCard;