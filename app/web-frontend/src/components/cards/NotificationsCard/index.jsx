import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';
import YouTube from 'react-youtube';
import { getIdIfYoutubeLink } from 'utils/helpers/getIdFromYoutubeLink';
import MediaPreview from 'components/media/preview';
import './index.css';

function NotificationsCard({
  notification,
  creationType,
  mediaUrl = '',
  handleCreationCardClick,
}) {
  const [mediaType, setMediaType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  useEffect(() => {
    const x = creationType || getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);
  const options = {
    height: '180',
    width: '180',
  };
  // const handleMediaPreview = () => {
  //   setShowMediaPreview(true);
  // };

  return (
    <>
      <div
        className="notification-card"
        {...accessibleOnClick(handleCreationCardClick, notification.notification_link)}
      >
        <div className="notification-img">
          {mediaType === 'image' && (
            <img className="treding-card-media" alt="collection-card-hero" src={mediaUrl} />
          )}
          {mediaType === 'youtube_video' && (
          <YouTube videoId={getIdIfYoutubeLink(mediaUrl)} opts={options} />
          )}
          {mediaType === 'video' && (
            <video
              className="treding-card-media"
              preload="metadata"
            >
              <source src={`${mediaUrl}#t=0.5`} type="video/mp4" />
              <track kind="captions" srcLang="en" label="english_captions" />
            </video>
          )}
          {mediaType === 'audio' && (
            <div className="treding-card-media creation-card-media-overlay" />
          )}
          {(mediaType === 'document' || mediaType === null) && (
            <div className="treding-card-media creation-card-media-overlay" />
          )}
        </div>
        <div className="notification-detial">
          <div>
            <h6 className="notification-title">
              {notification.notification_title}
            </h6>
            <span className="notification-body">
              {notification.notification_description}
            </span>
          </div>
          <Button
            className="notification-btn"
            onClick={(event) => {
              event.stopPropagation();
              setShowMediaPreview(true);
            }}
          >
            Mark Read
          </Button>
        </div>
      </div>
      {
        showMediaPreview && (
          <MediaPreview
            mediaType={mediaType}
            mediaUrl={mediaUrl}
            onClose={() => setShowMediaPreview(false)}
          />
        )
      }
    </>
  );
}

export default NotificationsCard;
