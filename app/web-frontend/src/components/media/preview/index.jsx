/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import { Button } from '@mui/material';
import DownloadIconSVG from 'assets/svgs/download.svg';
import './index.css';

function MediaPreview({ mediaType, mediaUrl, onClose }) {
  return (
    <div
      className="media-preview-container"
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        className={`media-preview-content ${mediaType === 'audio' && 'media-preview-content-audio'
        } ${mediaType === 'document'
          && !mediaUrl.includes('.pdf')
          && 'media-preview-content-unsupported'
        }`}
      >
        {mediaType === 'image' && <img src={mediaUrl} alt="" />}
        {mediaType === 'video' && <video src={mediaUrl} controls />}
        {mediaType === 'audio' && <audio src={mediaUrl} controls />}
        {mediaType === 'document' && mediaUrl.includes('.pdf') && <embed src={mediaUrl} />}
        {mediaType === 'document' && !mediaUrl.includes('.pdf') && (
          <>
            <h4 className="heading h4">Are you okay to download this file?</h4>
            <a href={mediaUrl}>{mediaUrl}</a>
            <div className="media-preview-content-options">
              <Button className="btn btn-primary-outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="btn btn-primary icon-btn"
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                onClick={() => window.open(mediaUrl)}
              >
                <img src={DownloadIconSVG} alt="" />
                Download
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MediaPreview;
