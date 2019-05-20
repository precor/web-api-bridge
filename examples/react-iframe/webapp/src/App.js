import React, { Component } from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import logo from './logo.svg';
import './App.css';

const origin = process.env.REACT_APP_PARENT_ORIGIN;

class MyIframeApi {
  constructor(send) {
    this.send = send;
  }
  setOnWelcome = onWelcome => this.onWelcome = onWelcome;
  welcome = welcome => {
    console.log('got welcome message');
    this.onWelcome(welcome);
  }
  howOldAreYou = () => {
    console.log('asking for age');
    return this.send('howOldAreYou', null, true);
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.webApiBridge = new WebApiBridge();
    this.myIframeApi = new MyIframeApi(this.webApiBridge.send.bind(this.webApiBridge));
    this.myIframeApi.setOnWelcome(welcome => this.setState({ welcome }));
    this.webApiBridge.origin = origin;
    this.webApiBridge.targetOrigin = origin;
    this.webApiBridge.apis = [this.myIframeApi];
    window.addEventListener('message', event => this.webApiBridge.onMessage(event, event.data));
    this.webApiBridge.target = window.parent;
    // enable to log all webapp messsages:
    // this.webApiBridge.listener = (message) => { console.log(message); };
    this.state = {};
  }

  render() {
    let { welcome, age } = this.state;
    if (welcome && !age) {
      this.myIframeApi.howOldAreYou()
        .then(age => this.setState({ age }));
    }

    return (
      <div className="App">
        <header className="App-header">
          <p>webapp iframe</p>
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            {!(welcome && age) ? 'waiting...' : `from parent: ${welcome}, I'm: ${age}`}
          </p>
        </header>
      </div>
    );
  }
}

export default App;
