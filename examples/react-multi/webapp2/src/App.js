import React, { Component } from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import './App.css';

const parentOrigin = process.env.REACT_APP_PARENT_ORIGIN;

const getPhoto = async (id) => {
  const response = await fetch((id)
    ? `https://picsum.photos/id/${id}/${window.innerWidth}/${window.innerHeight}/`
    : `https://picsum.photos/${window.innerWidth}/${window.innerHeight}/`);
  const newId = response.url.split('/')[4];
  const imageBlob = await response.blob();
  return { id: newId, imageUrl: URL.createObjectURL(imageBlob) };
};

// implements Api2
class App extends Component {
  constructor(props) {
    super(props);

    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.ipc = window.parent;
    this.webApiBridge.origin = parentOrigin;
    this.webApiBridge.targetOrigin = parentOrigin;
    this.send = this.webApiBridge.send.bind(this.webApiBridge);
    this.webApiBridge.apis = [this];
    window.addEventListener('message', event => this.webApiBridge.onMessage(event, event.data));
    this.state = {};
    this.displayNewPhoto();
    window.onresize = () => {
      getPhoto(this.state.id).then((photoInfo) => this.setState(photoInfo));
    };
    // enable to log all webapp messsages:
    // this.webApiBridge.listener = (message) => { console.log(message); };
  }

  displayNewPhoto = () => {
    getPhoto().then((photoInfo) => this.setState(photoInfo));
  }

  photoClicked = () => {
    this.send('photoClicked', [this.state.id], false)
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
