import React, { useEffect } from 'react';
import { startApis } from 'webapp-library';
import { common, api2 } from 'webapp-library/LibType2';
import { photoClicked } from 'webapp-library/LibType2/Api2';
import './App.css';
import usePicsum from './usePicsum';

const parentOrigin = process.env.REACT_APP_PARENT_ORIGIN;

const App = () => {
  console.log('render webapp2');
  const [photoInfo, setPhotoInfo] = usePicsum();
  const { url, id } = photoInfo;

  useEffect(() => {
    startApis(parentOrigin);
    api2.setCallback('displayNewPhoto', () => setPhotoInfo(pi => (
      { ...pi, id: undefined }
    )));
    common.setCallback('displayGrayscale', displayGrayscale => setPhotoInfo(pi => (
      { ...pi, grayscale: displayGrayscale }
    )));
    common.setCallback('displayBlur', displayBlur => setPhotoInfo(pi => (
      { ...pi, blur: displayBlur }
    )));
  }, [setPhotoInfo]);

  if (!url) return null;
  return <img src={url} alt="" onClick={() => photoClicked(id)} />;
};

export default App;
