export const getIdIfYoutubeLink = (url) => {
  // eslint-disable-next-line unicorn/better-regex
  const urlArray = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
  // eslint-disable-next-line unicorn/better-regex
  return (urlArray[2] !== undefined) ? urlArray[2].split(/[^0-9a-z_]/i)[0] : urlArray[0];
};
