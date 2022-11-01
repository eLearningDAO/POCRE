import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';
import { MediaPreview } from '../CreationCard';
import './index.css';

function TrendingCard({
  trending,
  mediaUrl = 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?cs=srgb&dl=pexels-pixabay-415071.jpg&fm=jpg',
  handleCreationCardClick,
}) {
  const [mediaType, setMediaType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);
  useEffect(() => {
    const x = getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);

  // const handleMediaPreview = () => {
  //   setShowMediaPreview(true);
  // };

  return (
    <>
      <div
        className="trending-card"
        {...accessibleOnClick(handleCreationCardClick, trending.creation_id)}
      >
        <div className="trending-img">
          {mediaType === 'image' && (
            <img className="treding-card-media" alt="collection-card-hero" src={mediaUrl} />
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
        <div className="trending-detial">
          <div>
            <h6 className="trending-title">
              {trending.creation_title}
            </h6>
            <span className="trending-body">
              {trending.creation_description}
            </span>
          </div>
          <Button
            className="trending-btn"
            onClick={(event) => {
              event.stopPropagation();
              setShowMediaPreview(true);
            }}
          >
            Preview
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

export default TrendingCard;
