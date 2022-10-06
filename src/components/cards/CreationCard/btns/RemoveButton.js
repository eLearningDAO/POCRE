import Button from '@mui/material/Button';
import React from 'react';
import DeleteIconSVG from '../../../../assets/svgs/delete.svg';
import useUserInfo from '../../../../hooks/user/userInfo';

function RemoveButton({ canDelete, handleDeleteConfirmation }) {
  const login = useUserInfo((s) => s.login);
  return (
    (login && canDelete && (
      <Button className="collection-card-action-btn" onClick={handleDeleteConfirmation}>
        <img src={DeleteIconSVG} alt="" />
      </Button>
    ))
    || ''
  );
}

export default RemoveButton;