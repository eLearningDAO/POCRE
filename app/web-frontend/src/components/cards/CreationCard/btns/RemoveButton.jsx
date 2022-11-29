import Button from '@mui/material/Button';
import DeleteIconSVG from 'assets/svgs/delete.svg';
import authUser from 'utils/helpers/authUser';

function RemoveButton({ canDelete, handleDeleteConfirmation }) {
  const login = authUser.getUser() && authUser.getJWTToken();
  const isVisible = login && canDelete;
  return isVisible
    ? (
      <Button className="collection-card-action-btn" onClick={handleDeleteConfirmation}>
        <img src={DeleteIconSVG} alt="" />
      </Button>
    )
    : null;
}

export default RemoveButton;
