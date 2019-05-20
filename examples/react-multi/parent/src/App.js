import React, { Component } from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import './App.css';

const api1App = process.env.REACT_APP_WEBAPP1API1;

const api2Apps = [
  // two instances of webapp1
  process.env.REACT_APP_WEBAPP1API2,
  process.env.REACT_APP_WEBAPP1API2,
  // two instances of webapp2, with the same url (for now)
  process.env.REACT_APP_WEBAPP2,
  process.env.REACT_APP_WEBAPP2,
];

// to keep track of created iframes that use webApiBridges
const bridgedIframes = [];

class Api1 {
  constructor(send) {
    this.send = send;
  }

  setSend = (send) => {
    this.send = send;
  };

  photoSelected = (id) => {
    this.send('photoSelected', [id], false);
  };
}

class Api2 {
  constructor(send) {
    this.send = send;
  }

  setSend = (send) => {
    this.send = send;
  };

  photoClicked = (id) => {
    const api1Iframe = bridgedIframes.find(bridgedIframe => {
      return bridgedIframe.props.api instanceof Api1
    });
    api1Iframe.props.api.photoSelected(id);
    bridgedIframes.forEach(bridgedIframe => {
      if (bridgedIframe.props.api !== this && bridgedIframe.props.api instanceof Api2) {
        bridgedIframe.props.api.displayNewPhoto();
      }
    });
  };

  displayNewPhoto = () => {
    this.send('displayNewPhoto', null, false);
  };
}

// we need to route messages coming from 5 iframes to the correct bridge
window.addEventListener('message', (event) => {
  if (event && event.origin && event.data && typeof event.data === 'string') {
    const targetIframe = bridgedIframes.find(bridgedIframe => (
      event.source === bridgedIframe.webApiBridge.target
    ));
    if (targetIframe) {
      targetIframe.webApiBridge.onMessage(event, event.data);
    }
  }
});

class BridgedIframe extends Component {
  constructor(props) {
    super(props);
    const { src, api } = this.props;

    const url = new URL(src);
    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.origin = url.origin;
    this.webApiBridge.targetOrigin = url.origin;
    this.webApiBridge.apis = [api];
    api.setSend(this.webApiBridge.send.bind(this.webApiBridge));
    bridgedIframes.push(this);
    this.state = { selectedPhoto: false };
    // enable to log all webapp messsages:
    // this.webApiBridge.listener = (message) => { console.log(message); };
  }

  setIframe = (iframe) => {
    if (!iframe || this.iframe) {
      return;
    }
    this.iframe = iframe;
    this.webApiBridge.target = iframe.contentWindow;
    this.iframe.onload = () => {
      console.log(`${iframe.src} loaded`);
    };
  }

  render() {
    const { src, api, ...rest } = this.props;
    console.log(`render iframe: ${src}`)

    return (
      <iframe
        src={src}
        title={src}
        ref={(iframe) => { this.setIframe(iframe); }}
        scrolling="no"
        { ...rest }
      />
    );
  }
}

class App extends Component {
  render() {
    console.log('render parent');
    return (
      <div>
        <div>
          <BridgedIframe className="fullscreen-iframe"
            src={api1App}
            api={new Api1()}
          />
        </div>
        <div className="container">
          <div className="row">
            {api2Apps.map((src, index) => (
              <BridgedIframe
                className="image-select"
                key={index}
                src={src}
                api={new Api2()}
              />
            ))}
          </div>
          <div className="overlay-text">
            Click on one of the 4 photos  
          </div>
        </div>
      </div>
    );
  }
}

export default App;
