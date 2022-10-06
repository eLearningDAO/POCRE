import React from 'react';
import Button from '@mui/material/Button';

import DownloadIcon from '../../../../assets/download.png';

function DownloadButton() {
  return (
    <Button className="collection-card-action-btn">
      <img src={DownloadIcon} alt="" />
    </Button>
  );
}

export default DownloadButton;
