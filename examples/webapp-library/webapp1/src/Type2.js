import React, { Component } from 'react';
import { common, api2 } from 'webapp-library/LibType2';
import { photoClicked } from 'webapp-library/LibType2/Api2';
import { setBlur, setGrayscale } from 'webapp-library/LibType2/Api3';
import './App.css';
import getPhoto from './getPhoto';

const setDisplaySetting = {
  useGrayscale: setGrayscale,
  useBlur: setBlur,
};

class Type2 extends Component {
  constructor(props) {
    super(props);

    this.state = { useGrayscale: false, useBlur: false };
    api2.setCallback('displayNewPhoto', this.displayNewPhoto);
    common.setCallback('displayGrayscale', (grayscale) => {
      const { id, blur } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });
    common.setCallback('displayBlur', (blur) => {
      const { id, grayscale } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });

    window.onresize = () => {
      const { id, grayscale, blur } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    };

    this.displayNewPhoto();
  }

  displayNewPhoto = () => {
    const { grayscale, blur } = this.state;
    getPhoto({ grayscale, blur }).then(photoInfo => this.setState(photoInfo));
  }

  photoClicked = () => {
    const { id } = this.state;
    photoClicked(id);
  }

  handleInputChange = (event) => {
    const { target } = event;
    const value = (target.type === 'checkbox') ? target.checked : target.value;
    const { name } = target;
    setDisplaySetting[name](value);
    this.setState({ [name]: value });
  }

  render() {
    console.log('render webapp1.Type2');
    const { imageUrl, useGrayscale, useBlur } = this.state;
    const { canModPhotos } = this.props;

    if (!imageUrl) return null;

    return (
      <div className="container">
        <img src={imageUrl} alt="" onClick={this.photoClicked} />
        {(canModPhotos) && (
        <div className="top-overlay">
          <label>
            B/W:
            <input
              name="useGrayscale"
              type="checkbox"
              checked={useGrayscale}
              onChange={this.handleInputChange}
            />
          </label>
          <label>
            Blur:
            <input
              name="useBlur"
              type="checkbox"
              checked={useBlur}
              onChange={this.handleInputChange}
            />
          </label>
        </div>
        )}
      </div>
    );
  }
}

export default Type2;
