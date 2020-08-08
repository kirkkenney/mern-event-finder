import React from 'react';

import './LoadingSpinner.css';

const LoadingSpinner = props => {
  return (
    <div className={`${props.asOverlay && 'loading-spinner-overlay'}`}>
      <div className='loading-img-container'>
        <img src='/img/logo2.png' alt='Loading logo' />
      </div>
    </div>
  );
};

export default LoadingSpinner;
