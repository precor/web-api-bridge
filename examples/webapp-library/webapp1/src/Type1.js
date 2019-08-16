import React, { useEffect } from 'react';
import { setCallback as commonSetCallback } from 'webapp-library/LibType2';
import { setCallback } from 'webapp-library/LibType1';
import usePicsum from './usePicsum';


const Type1 = () => {
  console.log('render webapp1.Type1');
  const [photoInfo, setPhotoInfo] = usePicsum();
  const { url } = photoInfo;

  useEffect(() => {
    setCallback('photoSelected', id => setPhotoInfo(pi => (
      { ...pi, id }
    )));
    commonSetCallback('displayGrayscale', displayGrayscale => setPhotoInfo(pi => (
      { ...pi, grayscale: displayGrayscale }
    )));
    commonSetCallback('displayBlur', displayBlur => setPhotoInfo(pi => (
      { ...pi, blur: displayBlur }
    )));
  }, [setPhotoInfo]);

  if (!url) return null;
  return <img src={url} alt="" />;
};

export default Type1;
