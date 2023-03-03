import { Files } from 'api/requests';
import { useState } from 'react';

const useLinkValidation = ({
  customErrorMessage = '',
}) => {
  const [linkError, setLinkError] = useState(null);
  const [isValidatingLink, setIsValidatingLink] = useState(null);

  const validateLink = async (link) => {
    setIsValidatingLink(true);
    const response = await Files.getMediaType(`link=${link}`).catch(() => null);
    setIsValidatingLink(false);

    if (!response) {
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
