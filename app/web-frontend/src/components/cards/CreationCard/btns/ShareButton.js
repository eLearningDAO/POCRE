import React from 'react';
import Button from '@mui/material/Button';
import ShareIcon from 'assets/images/share.png';

function ShareButton({ onClick = () => {} }) {
  return (
    <Button className="collection-card-action-btn" onClick={onClick}>
      <img src={ShareIcon} alt="" />
    </Button>
  );
}

export default ShareButton;
