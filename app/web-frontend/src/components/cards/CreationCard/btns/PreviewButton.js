import React from 'react';
import Button from '@mui/material/Button';
import PreviewIcon from 'assets/svgs/preview.svg';

function PreviewButton({ onClick }) {
  return (
    <Button className="collection-card-action-btn" onClick={onClick}>
      <img src={PreviewIcon} alt="" />
    </Button>
  );
}

export default PreviewButton;
