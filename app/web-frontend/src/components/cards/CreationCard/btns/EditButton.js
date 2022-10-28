import React from 'react';
import Button from '@mui/material/Button';
import PencilIcon from 'assets/images/pencil.png';

function EditButton({ canEdit, onEditClick }) {
  return canEdit ? (
    <Button className="collection-card-action-btn" onClick={onEditClick}>
      <img src={PencilIcon} alt="" />
    </Button>
  ) : (
    ''
  );
}

export default EditButton;
