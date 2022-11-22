/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */
import React from 'react';
import {
  Button, Typography,
} from '@mui/material';
import {
  FacebookShareButton,
  FacebookIcon,
  LinkedinIcon,
  LinkedinShareButton,
  TwitterShareButton,
  TwitterIcon,
} from 'react-share';
import CloseIcon from 'assets/svgs/close.svg';
import './index.css';

function SocialMediaModal({ shareUrl = '', subjectTitle = 'Creation', onClose }) {
  return (
    <div
      className="creation-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div className="share-preview">
        <div className="creation-preview-header">
          <Typography className="heading h4">
            Sharing the
            <span className="subject-title">
              {subjectTitle}
            </span>
          </Typography>
          <Button padding="0" minWidth="0" onClick={onClose}>
            <img src={CloseIcon} height="24" width="24" alt="" />
          </Button>
        </div>
        <div className="share-preview-content">
          <div className="facebook-network">
            <FacebookShareButton
              url={shareUrl}
              title="I'm happy to share this original work"
              className="facebook-network__share-button"
            >
              <FacebookIcon size={48} round />
            </FacebookShareButton>
            <div className="facebook-network__share-count">Facebook</div>
          </div>

          <div className="linkedin-network">
            <LinkedinShareButton
              url={shareUrl}
              title="I'm happy to share this original work"
              className="linkedin-network__share-button"
            >
              <LinkedinIcon size={48} round />
            </LinkedinShareButton>
            <div className="linkedin-network__share-count">Linkedin</div>
          </div>

          <div className="twitter-network">
            <TwitterShareButton
              url={shareUrl}
              title="I'm happy to share this original work"
              className="twitter-network__share-button"
            >
              <TwitterIcon size={48} round />
            </TwitterShareButton>

            <div className="twitter-network__share-count">Twitter</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SocialMediaModal;
