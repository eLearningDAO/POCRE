import { Files } from 'api/requests';
import { useState } from 'react';

const getIdIfYoutubeLink = (url) => {
  // eslint-disable-next-line unicorn/better-regex
  const urlArray = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  // eslint-disable-next-line unicorn/better-regex
  return (urlArray[2] !== undefined) ? urlArray[2].split(/[^0-9a-z_\-]/i)[0] : urlArray[0];
};

const isValidYoutubeID = async (youtubeID) => {
  const thumbnailLink = `https://img.youtube.com/vi/${youtubeID}/0.jpg`;
  return await fetch(thumbnailLink, {
    method: 'GET',
    redirect: 'follow',
  });
};

const useLinkValidation = ({
  customErrorMessage = '',
}) => {
  const [linkError, setLinkError] = useState(null);
  const [isValidatingLink, setIsValidatingLink] = useState(null);

  const validateLink = async (link) => {
    setIsValidatingLink(true);
    const response = await Files.getMediaType(`link=${link}`).catch(() => null);
    const youtubeId = getIdIfYoutubeLink(link);
    const isYoutubeVideo = await isValidYoutubeID(youtubeId);
    setIsValidatingLink(false);

    if (!response && !isYoutubeVideo) {
      setLinkError(customErrorMessage || 'Invalid link');
      return null;
    }

    setLinkError(null);
    return response;
  };

  const resetLinkError = () => setLinkError(null);

  return {
    linkError,
    validateLink,
    resetLinkError,
    isValidatingLink,
  };
};

export default useLinkValidation;
