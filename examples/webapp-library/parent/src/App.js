import React from 'react';
import BridgedIframe from './BridgedIframe';
import './App.css';

const LibType1App = { src: process.env.REACT_APP_WEBAPP1, type: 'LibType1', apis: ['Common', 'Api1'] };

const LibType2Apps = [
  // two instances of webapp1, the first one can set blur and grayscale
  { src: process.env.REACT_APP_WEBAPP1, type: 'LibType2', apis: ['Common', 'Api2', 'Api3'] },
  { src: process.env.REACT_APP_WEBAPP1, type: 'LibType2', apis: ['Common', 'Api2'] },
  // two instances of webapp2
  { src: process.env.REACT_APP_WEBAPP2, type: 'LibType2', apis: ['Common', 'Api2'] },
  { src: process.env.REACT_APP_WEBAPP2, type: 'LibType2', apis: ['Common', 'Api2'] },
];

const App = () => {
  console.log('render parent');
  return (
    <div>
      <div>
        <BridgedIframe
          className="fullscreen-iframe"
          src={LibType1App.src}
          type={LibType1App.type}
          apis={LibType1App.apis}
        />
      </div>
      <div className="container">
        <div className="row">
          {LibType2Apps.map(({ src, type, apis }, index) => (
            <BridgedIframe
              className="image-select"
              // eslint-disable-next-line react/no-array-index-key
              key={`LibType2_${index}`}
              src={src}
              type={type}
              apis={apis}
            />
          ))}
        </div>
        <div className="overlay-text">
          Click on one of the 4 photos
        </div>
      </div>
    </div>
  );
};

export default App;
