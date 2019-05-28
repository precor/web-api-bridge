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

// implements Api1
class Page1 extends Component {
  constructor(props) {
    super(props);
    this.send = props.send;
    props.setApis([this]);
    this.state = {};
    window.onresize = () => {
      const { id } = this.state;
      this.photoSelected(id);
    };
    this.photoSelected(undefined);
  }

  photoSelected = (id) => {
    getPhoto(id).then(photoInfo => this.setState(photoInfo));
  };

  render() {
    console.log('render Page1');
    const { imageUrl } = this.state;
    if (!imageUrl) return null;

    return (
      <img src={imageUrl} alt="" />
    );
  }
}

// implements Api2
class Page2 extends Component {
  constructor(props) {
    super(props);
    this.send = props.send;
    props.setApis([this]);
    this.state = {};
    this.displayNewPhoto();
    window.onresize = () => {
      const { id } = this.state;
      getPhoto(id).then(photoInfo => this.setState(photoInfo));
    };
  }

  displayNewPhoto = () => {
    getPhoto().then((photoInfo) => { this.setState(photoInfo); });
  }

  photoClicked = () => {
    const { id } = this.state;
    this.send('photoClicked', [id], false);
  }

  render() {
    console.log('render Page2');
    const { imageUrl } = this.state;
    if (!imageUrl) return null;

    return (
      <img src={imageUrl} alt="" onClick={this.photoClicked} />
    );
  }
}

// in this example the api is determined by the hash route. another solution is to have a
// common api that returns the api type, that approach would allow different apis to be
// supported using the same url
const apiComponents = {
  '/page1/': Page1,
  '/page2/': Page2,
};

class App extends Component {
  constructor(props) {
    super(props);

    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.target = window.parent;
    this.webApiBridge.origin = parentOrigin;
    this.webApiBridge.targetOrigin = parentOrigin;
    this.send = this.webApiBridge.send.bind(this.webApiBridge);
    window.addEventListener('message', event => this.webApiBridge.onMessage(event, event.data));
    // enable to log all webapp messsages:
    // this.webApiBridge.listener = (message) => { console.log(message); };
  }

  setApis = (apis) => {
    this.webApiBridge.apis = apis;
  }

  render() {
    if (!window.location.hash) return null;
    console.log(`webapp1 render ${window.location.hash.substr(1)}`);
    const PageComponent = apiComponents[window.location.hash.substr(1)];

    return (
      <PageComponent
        setApis={this.setApis}
        send={this.send}
      />
    );
  }
}

export default App;
