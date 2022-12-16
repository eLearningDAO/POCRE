/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import {
  Button, Typography,
} from '@mui/material';
import CloseIcon from 'assets/svgs/close.svg';
import './index.css';

function Modal({
  title = '',
  children,
  onClose = () => {},
  className = '',
}) {
  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className={`creation-preview ${className}`}>
        <div className="creation-preview-header">
          <Typography className="heading h4">{title}</Typography>
          <Button padding="0" minWidth="0" onClick={onClose}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="creation-preview-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
