import React from 'react';
import PropTypes from 'prop-types';
import './index.css';

function Loader({ withBackdrop, size }) {
  return (
    withBackdrop ? (
      <div className="backdrop">
        <div className={`loader loader-${size}`} />
      </div>
    )
      : <div className={`loader loader-${size}`} />
  );
}

Loader.propTypes = {
  withBackdrop: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
};

Loader.defaultProps = {
  withBackdrop: false,
  size: 'small',
};

export default Loader;
