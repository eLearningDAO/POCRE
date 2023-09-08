// Modified version of https://stackoverflow.com/questions/36637146/encode-string-to-hex

export const toHex = (text) => [...text]
  .map((c) => c.codePointAt(0).toString(16).padStart(2, '0'))
  .join('');

export const fromHex = (hex) => hex.split(/(\w\w)/g)
  .filter((p) => !!p)
  .map((c) => String.fromCodePoint(Number.parseInt(c, 16)))
  .join('');
