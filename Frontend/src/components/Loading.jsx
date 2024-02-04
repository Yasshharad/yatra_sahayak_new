import React from 'react';

function Loading() {
  return (
    <div className='loading-container'>
      <img src="./public/images/spinner.gif" alt="" />
      <br />
      <p>Your Itinerary is being generated. Please wait...</p>
    </div>
  );
}

export default Loading;