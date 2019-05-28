import React, { Component } from 'react';
import { common } from 'webapp-library/LibType2';
import { setCallback } from 'webapp-library/LibType1/Api1';
import getPhoto from './getPhoto';

class Type1 extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    setCallback('photoSelected', this.photoSelected);

    window.onresize = () => {
      const { id } = this.state;
      this.photoSelected(id);
    };
    common.setCallback('displayGrayscale', (grayscale) => {
      const { id, blur } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });
    common.setCallback('displayBlur', (blur) => {
      const { id, grayscale } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });
    this.photoSelected(undefined);
  }

  photoSelected = (id) => {
    const { grayscale, blur } = this.state;
    getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
  };

  render() {
    console.log('render webapp1.Type1');
    const { imageUrl } = this.state;
    if (!imageUrl) return null;

    return (
      <img src={imageUrl} alt="" />
    );
  }
}

export default Type1;
