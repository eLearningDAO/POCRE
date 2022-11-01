import React from 'react';
import Button from '@mui/material/Button';
import DownloadIcon from 'assets/images/download.png';

function DownloadButton({ onClick }) {
  return (
    <Button className="collection-card-action-btn" onClick={onClick}>
      <img src={DownloadIcon} alt="" />
    </Button>
  );
}

export default DownloadButton;
