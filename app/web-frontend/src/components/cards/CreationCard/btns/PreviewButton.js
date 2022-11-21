import React from 'react';
import Button from '@mui/material/Button';
import PreviewIcon from 'assets/images/previewicons.png';

function PreviewButton({ onClick }) {
  return (
    <Button className="collection-card-action-btn" onClick={onClick}>
      <img src={PreviewIcon} alt="" width={26} />
    </Button>
  );
}

export default PreviewButton;
