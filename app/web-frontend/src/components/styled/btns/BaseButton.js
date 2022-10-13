import React from 'react';

function BaseButton({ text, ...rest }) {
  return <button {...rest}>{text}</button>;
}

export default BaseButton;
