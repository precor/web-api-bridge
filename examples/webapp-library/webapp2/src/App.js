import React, { Component } from 'react';
import { startApis, libType2 } from 'webapp-library';
import { common } from 'webapp-library/LibType2';
import { photoClicked, setCallback } from 'webapp-library/LibType2/Api2';
import './App.css';

const getPhoto = async ({ id, grayscale, blur }) => {
  let url = (id)
    ? `https://picsum.photos/id/${id}/${window.innerWidth}/${window.innerHeight}/`
    : `https://picsum.photos/${window.innerWidth}/${window.innerHeight}/`;
  if (grayscale) url = `${url}?grayscale`;
  if (blur) url = (grayscale) ? `${url}&blur` : `${url}?blur`;
  const response = await fetch(url);
  const newId = response.url.split('/')[4];
  const imageBlob = await response.blob();
  return {
    id: newId, imageUrl: URL.createObjectURL(imageBlob), grayscale, blur,
  };
};

// implements Api2
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    setCallback('displayNewPhoto', this.displayNewPhoto);
    libType2.common.setCallback('displayGrayscale', (grayscale) => {
      const { id, blur } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });
    common.setCallback('displayBlur', (blur) => {
      const { id, grayscale } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    });
    this.displayNewPhoto();

    window.onresize = () => {
      const { id, grayscale, blur } = this.state;
      getPhoto({ id, grayscale, blur }).then(photoInfo => this.setState(photoInfo));
    };

    startApis().then(({ type, apis }) => { console.log('startApis: ', type, apis); });
  }

  photoClicked = () => {
    const { id } = this.state;
    photoClicked(id);
  }

  displayNewPhoto = () => {
    const { grayscale, blur } = this.state;
    getPhoto({ grayscale, blur }).then(photoInfo => this.setState(photoInfo));
  }

  render() {
    console.log('render webapp2');
    const { imageUrl } = this.state;
    if (!imageUrl) return null;

    return (
      <img src={imageUrl} alt="" onClick={this.photoClicked} />
    );
  }
}

export default App;
