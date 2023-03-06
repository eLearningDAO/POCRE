import { useEffect, useState } from 'react';
import { getUrlFileType } from 'utils/helpers/getUrlFileType';
import { accessibleOnClick } from 'utils/helpers/accessibleOnClick';
import YouTube from 'react-youtube';
import { getIdIfYoutubeLink } from 'utils/helpers/getIdFromYoutubeLink';
import MediaPreview from 'components/media/preview';
import './index.css';

function LatestNewsCard({
  material,
  mediaUrl = 'https://images.pexels.com/photos/415071/pexels-photo-415071.jpeg?cs=srgb&dl=pexels-pixabay-415071.jpg&fm=jpg',
}) {
  const [mediaType, setMediaType] = useState(null);
  const [showMediaPreview, setShowMediaPreview] = useState(false);

  useEffect(() => {
    const x = getUrlFileType(mediaUrl);
    setMediaType(x);
  }, []);

  const handleRecognizedMaterialCardClick = () => {
    setShowMediaPreview(true);
  };
  const options = {
    height: '250',
    width: '280',
  };
  return (
    <>
      <div
        className="latest-news-card"
        {...accessibleOnClick(handleRecognizedMaterialCardClick, material.material_id)}
      >
        <div className="latest-news-image-container">
          {mediaType === 'image' && (
            <img className="news-card-media" alt="collection-card-hero" src={mediaUrl} />
          )}
          {mediaType === 'youtube_video' && (
          <YouTube videoId={getIdIfYoutubeLink(mediaUrl)} opts={options} />
          )}
          {mediaType === 'video' && (
            <video
              className="news-card-media"
              preload="metadata"
            >
              <source src={`${mediaUrl}#t=0.5`} type="video/mp4" />
              <track kind="captions" srcLang="en" label="english_captions" />
            </video>
          )}
          {mediaType === 'audio' && (
            <div className="news-card-media creation-card-media-overlay" />
          )}
          {(mediaType === 'document' || mediaType === null) && (
            <div className="news-card-media creation-card-media-overlay" />
          )}
        </div>
        <div className="latest-news-body">
          <h6>
            {material.material_title}
          </h6>
          <span>
            May 15, 2022
          </span>
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
export default LatestNewsCard;
