import React, { Component } from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import './App.css';

const iframeUrl = process.env.REACT_APP_WEBAPP;
const iframeOrigin = new URL(process.env.REACT_APP_WEBAPP).origin;


class MyMainApi {
  constructor(send) {
    this.send = send;
  }

  welcome = (message) => {
    console.log('sending welcome message to iframe');
    this.send('welcome', [message], false);
  };

  howOldAreYou = () => (
    new Promise((resolve) => {
      console.log('sending age to iframe');
      resolve(3);
    })
  );
}

class App extends Component {
  constructor(props) {
    super(props);
    this.webApiBridge = new WebApiBridge();
    this.myMainApi = new MyMainApi(this.webApiBridge.send.bind(this.webApiBridge));
    this.webApiBridge.origin = iframeOrigin;
    this.webApiBridge.targetOrigin = iframeOrigin;
    this.webApiBridge.apis = [this.myMainApi];
    window.addEventListener('message', event => this.webApiBridge.onMessage(event, event.data));
    // enable to log all webapp messsages:
    // this.webApiBridge.listener = (message) => { console.log(message); };
  }

  setIframe = (iframe) => {
    if (!iframe || this.iframe) {
      return;
    }
    this.iframe = iframe;
    this.webApiBridge.ipc = iframe.contentWindow;
    this.iframe.onload = () => {
      console.log('iframeUrl loaded');
      this.myMainApi.welcome('hello iframe');
    };
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <iframe
              src={iframeUrl}
              title='iframe communications'
              ref={(iframe) => { this.setIframe(iframe); }}
          />
          <p>parent window</p>
        </header>
      </div>
    );
  }
}

export default App;
