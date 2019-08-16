import React, { useState, useEffect } from 'react';
import { setCallback } from 'webapp-library/LibType2';
import { photoClicked } from 'webapp-library/LibType2/Api2';
import { setBlur, setGrayscale } from 'webapp-library/LibType2/Api3';
import './App.css';
import usePicsum from './usePicsum';

const useCheckbox = (initialValue, changeAction) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (event) => {
    const { target } = event;
    const { checked } = target;
    setValue(checked);
    changeAction(checked);
  };
  return { value, onChange: handleChange, type: 'checkbox' };
};

const Type2 = ({ canModPhotos }) => {
  console.log('render webapp1.Type2');
  const [photoInfo, setPhotoInfo] = usePicsum();
  const grayscale = useCheckbox(false, setGrayscale);
  const blur = useCheckbox(false, setBlur);
  const { url, id } = photoInfo;

  useEffect(() => {
    setCallback('displayNewPhoto', () => setPhotoInfo(pi => (
      { ...pi, id: undefined }
    )));
    setCallback('displayGrayscale', displayGrayscale => setPhotoInfo(pi => (
      { ...pi, grayscale: displayGrayscale }
    )));
    setCallback('displayBlur', displayBlur => setPhotoInfo(pi => (
      { ...pi, blur: displayBlur }
    )));
  }, [setPhotoInfo]);

  if (!url) return null;
  return (
    <div className="container">
      <img src={url} alt="" onClick={() => photoClicked(id)} />
      {(canModPhotos) && (
      <div className="top-overlay">
        <label>
          B/W:
          <input {...grayscale} />
        </label>
        <label>
          Blur:
          <input {...blur} />
        </label>
      </div>
      )}
    </div>
  );
}

export default Type2;
