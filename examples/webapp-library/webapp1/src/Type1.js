import React, { useEffect } from 'react';
import { common } from 'webapp-library/LibType2';
import { setCallback } from 'webapp-library/LibType1/Api1';
import usePicsum from './usePicsum';


const Type1 = () => {
  console.log('render webapp1.Type1');
  const [photoInfo, setPhotoInfo] = usePicsum();
  const { url } = photoInfo;

  useEffect(() => {
    setCallback('photoSelected', id => setPhotoInfo(pi => (
      { ...pi, id }
    )));
    common.setCallback('displayGrayscale', displayGrayscale => setPhotoInfo(pi => (
      { ...pi, grayscale: displayGrayscale }
    )));
    common.setCallback('displayBlur', displayBlur => setPhotoInfo(pi => (
      { ...pi, blur: displayBlur }
    )));
  }, [setPhotoInfo]);

  if (!url) return null;
  return <img src={url} alt="" />;
};

export default Type1;
