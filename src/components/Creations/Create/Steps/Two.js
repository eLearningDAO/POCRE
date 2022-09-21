import {
  Button, Grid, TextField, Typography,
} from '@mui/material';
import React from 'react';
import InviteIcon from '../../../../assets/invite-icon.png';

export default function StepTwo() {
  return (
    <Grid item xs={12}>
      <Grid container className="create-collection" bgcolor="rgba(255, 255, 255, 0.28)" border="2px dashed #F78F8A">
        <Grid md={2} xs={12} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Title</Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="Material title"
          />
        </Grid>

        <Grid md={2} xs={12} marginTop={{ xs: '12px', md: '0px' }} paddingLeft={{ md: '24px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">File type</Typography>
        </Grid>
        <Grid xs={12} md={4}>
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="Select.."
          />
        </Grid>

        <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Link</Typography>
        </Grid>
        <Grid xs={12} md={10} marginTop={{ xs: '0px', md: '18px' }} display="flex" gap="8px" alignItems="center">
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="The link where this material is published (Google drive, Youtube, etc)"
          />
        </Grid>

        <Grid xs={12} md={2} marginTop={{ xs: '12px', md: '18px' }} display="flex" flexDirection="row" alignItems="center">
          <Typography className="heading">Author</Typography>
        </Grid>
        <Grid xs={12} md={8} marginTop={{ xs: '0px', md: '18px' }} display="flex" gap="8px" alignItems="center">
          <TextField
            variant="standard"
            InputProps={{
              disableUnderline: true,
            }}
            className="input input-dark"
            fullWidth
            placeholder="Select.."
          />
          <Button className="inviteButton" style={{ width: 'fit-content', paddingLeft: '24px', paddingRight: '24px' }}>
            <img width={17} style={{ marginRight: '10px' }} alt="invite-icon" src={InviteIcon} />
            {' '}
            Invite
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
}
