import {
  Box, Button, Grid, Typography, Chip,
} from '@mui/material';
import CreationCardImg from '../../../assets/creation-card.png';
import DownloadIcon from '../../../assets/download.png';
import PencilIcon from '../../../assets/pencil.png';
import ShareIcon from '../../../assets/share.png';
import './CollectionCard.css';

function CollectionCard({
  interactionBtns,
  creationDate = '2022-01-01 00:00:00',
  materials = [1, 2, 3, 4],
  title = 'Mobile App Design',
  description = '1000+ free files you can duplicate, remix, and reuse 1000+ free files',
}) {
  return (
    <Grid
      container
      className="collection-card"
      gap={{ xs: '24px', md: '32px' }}
      maxWidth={{ xs: '300px', sm: '400px', md: '100%' }}
      minWidth={{ xs: '300px', sm: '400px', md: '100%' }}
      flexWrap={{ md: 'nowrap' }}
    >

      <Grid
        item
        xs={12}
        md={6}
        lg={7}
        display="flex"
        flexDirection={{ xs: 'column', lg: 'row' }}
        gap={{ xs: '12px', sm: '12px', md: '16px' }}
        height="fit-content"
      >
        <img className="collection-card-image" alt="collection-card-hero" src={CreationCardImg} />
        <Box
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          justifyContent="center"
        >
          <Typography variant="h6" fontSize={{ xs: '18px', lg: '24px' }} marginBottom="5px">
            {title}
          </Typography>
          <Typography variant="p" component="p">
            {description}
          </Typography>
        </Box>
      </Grid>

      <Grid
        item
        xs={12}
        md={interactionBtns ? 5 : 6}
        lg={interactionBtns ? 4 : 5}
        display="flex"
        flexDirection="column"
        gap={{ xs: '12px', sm: '12px', md: '16px' }}
        borderLeft={{ md: '1px solid #EEF0F3' }}
        paddingLeft={{ md: '12px' }}
        borderRight={{ md: interactionBtns ? '1px solid #EEF0F3' : '' }}
        paddingRight={{ md: interactionBtns ? '12px' : '' }}
      >
        <div className="collection-member-images">
          {materials.length === 0 ? (
            <Chip style={{ backgroundColor: 'var(--color-orange)', color: 'var(--color-white)', fontSize: '14px' }} label="Unique Creation (no materials)" />
          )
            : materials.map(() => (
              <img src={`https://i.pravatar.cc/50?img=${Math.random()}`} alt="" />
            ))}
        </div>
        <Box alignItems="flex-start" display="flex" flexDirection="column" justifyContent="center">
          <Typography variant="h6" fontSize={{ xs: '16px', lg: '18px' }} marginBottom="5px">
            Date Created
          </Typography>
          <Typography variant="p" fontSize={{ xs: '14px', lg: '16px' }}>
            {creationDate}
          </Typography>
        </Box>
      </Grid>

      {interactionBtns && (
      <Grid item md={1} xs={12}>
        <Grid display="flex" flexDirection={{ xs: 'row', md: 'column', xl: 'arow' }} justifyContent="space-between" maxWidth="200px" margin={{ xs: 'auto', sm: '0' }} alignItems="center" gap={{ xs: '12px', md: '16px' }}>
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
      </Grid>
      )}
    </Grid>
  );
}

export default CollectionCard;
