/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import { Button } from '@mui/material';
import DownloadIconSVG from 'assets/svgs/download.svg';
import YouTube from 'react-youtube';
import { getIdIfYoutubeLink } from 'utils/helpers/getIdFromYoutubeLink';
import './index.css';

function MediaBlock({ mediaType, mediaUrl }) {
  const options = {
    height: '250',
    width: '280',
  };
  return (
    <div
      className="creation-media"
    >
      {mediaType === 'image' && (
        <img alt="collection-card-hero" src={mediaUrl} />
      )}
      {mediaType === 'youtube_video' && (
      <YouTube videoId={getIdIfYoutubeLink(mediaUrl)} opts={options} />
      )}
      {mediaType === 'video' && (
        <video
          src={mediaUrl}
          preload="metadata"
          controls
        />
      )}
      {mediaType === 'audio' && (
        <audio src={mediaUrl} controls />
      )}
      {mediaType === 'pdf' && (
        <embed src={mediaUrl} />
      )}
      {mediaType === 'document' && (
        <div className="unsupported-file-type">
          <h4 className="heading h4">Are you okay to download this file?</h4>
          <a href={mediaUrl}>{mediaUrl}</a>
          <div className="media-preview-content-options">
            <Button
              className="btn btn-primary icon-btn"
              // eslint-disable-next-line security/detect-non-literal-fs-filename
              onClick={() => window.open(mediaUrl)}
            >
              <img src={DownloadIconSVG} alt="" />
              Download
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MediaBlock;
