/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import './index.css';
import YouTube from 'react-youtube';
import { getIdIfYoutubeLink } from 'utils/helpers/getIdFromYoutubeLink';

function MediaTile({ mediaType, mediaUrl, onMediaClick }) {
  const options = {
    height: '200',
    width: '280',
  };
  return (
    <div
      className="collection-card-media-container"
      onClick={onMediaClick}
    >
      {mediaType === 'image' && (
      <img className="collection-card-media" alt="collection-card-hero" src={mediaUrl} />
      )}
      {mediaType === 'youtube_video' && (
      <YouTube videoId={getIdIfYoutubeLink(mediaUrl)} opts={options} />
      )}
      {mediaType === 'video' && (
      <>
        <video
          className="collection-card-media"
          src={`${mediaUrl}#t=0.5`}
          preload="metadata"
        />
        <div className="overlay-button">
          <svg
            stroke="#ffffff"
            fill="#ffffff"
            strokeWidth="0"
            viewBox="0 0 448 512"
            height="44px"
            width="44px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
          </svg>
        </div>
      </>
      )}
      {mediaType === 'audio' && (
      <>
        <div className="collection-card-media creation-card-media-overlay" />
        <div className="overlay-button">
          <svg
            stroke="#ffffff"
            fill="#ffffff"
            strokeWidth="0"
            viewBox="0 0 448 512"
            height="44px"
            width="44px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M424.4 214.7L72.4 6.6C43.8-10.3 0 6.1 0 47.9V464c0 37.5 40.7 60.1 72.4 41.3l352-208c31.4-18.5 31.5-64.1 0-82.6z" />
          </svg>
        </div>
      </>
      )}
      {(mediaType === 'document' || mediaType === 'pdf' || mediaType === null) && (
      <>
        <div className="collection-card-media creation-card-media-overlay" />
        <div className="overlay-button">
          <svg
            stroke="#ffffff"
            fill="#ffffff"
            strokeWidth="0"
            viewBox="0 0 512 512"
            height="64px"
            width="64px"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M428 224H288a48 48 0 01-48-48V36a4 4 0 00-4-4h-92a64 64 0 00-64 64v320a64 64 0 0064 64h224a64 64 0 0064-64V228a4 4 0 00-4-4zm-92 160H176a16 16 0 010-32h160a16 16 0 010 32zm0-80H176a16 16 0 010-32h160a16 16 0 010 32z" />
            <path d="M419.22 188.59L275.41 44.78a2 2 0 00-3.41 1.41V176a16 16 0 0016 16h129.81a2 2 0 001.41-3.41z" />
          </svg>
        </div>
      </>
      )}
    </div>
  );
}

export default MediaTile;
