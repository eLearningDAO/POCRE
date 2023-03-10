export const getIdIfYoutubeLink = (url) => {
  // eslint-disable-next-line unicorn/better-regex
  const urlArray = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  console.log('This is the url array',urlArray)
  // eslint-disable-next-line unicorn/better-regex
  return (urlArray[2] !== undefined) ? urlArray[2] : urlArray[0];
};
