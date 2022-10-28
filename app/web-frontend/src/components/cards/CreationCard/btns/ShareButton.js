import React from 'react';
import Button from '@mui/material/Button';
import ShareIcon from 'assets/images/share.png';

function ShareButton() {
  return (
    <Button className="collection-card-action-btn">
      <img src={ShareIcon} alt="" />
    </Button>
  );
}

export default ShareButton;
