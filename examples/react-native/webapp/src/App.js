import React, { useState, useEffect } from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import logo from './logo.svg';
import './App.css';

class MyWebViewApi {
  constructor(myWebViewApi) {
    console.log('creating MyWebViewApi');
    webApiBridge.apis = [this];
    webApiBridge.useReactNativeWebView = true;
    webApiBridge.target = window;
    this.send = webApiBridge.send.bind(webApiBridge);
  }

  setOnWelcome = (onWelcome) => {
    console.log('setting onWelcome callback');
    this.onWelcome = onWelcome;
  };

  welcome = (welcome) => {
    console.log('got welcome message');
    this.onWelcome(welcome);
  };

  howOldAreYou = () => {
    console.log('asking for age');
    return this.send('howOldAreYou', null, true);
  };
}

const webApiBridge = new WebApiBridge();
const myWebViewApi = new MyWebViewApi(webApiBridge);

function App() {
  const [age, setAge] = useState();
  const [welcome, setWelcome] = useState();

  useEffect(() => {
    myWebViewApi.setOnWelcome(setWelcome);
    const handleMessages = (event) => {
      console.log(event);
      if (event.origin === '') {
        webApiBridge.onMessage(event, event.data);
      }
    };
    console.log('adding event listener');
    window.addEventListener('message', handleMessages);
    return () => window.removeEventListener('message', handleMessages);
  }, []);

  useEffect(() => {
    async function getAge() {
      const updatedAge = await myWebViewApi.howOldAreYou();
      setAge(updatedAge);
    }
    if (welcome && !age) {
      getAge();
    }
  }, [welcome, age]);

  return (
    <div className="App">
      <header className="App-header" style={{ flex: 1 }}>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          {!(welcome && age)
            ? 'waiting...'
            : `from React Native: ${welcome}, I'm: ${age}`}{' '}
        </p>
      </header>
    </div>
  );
}

export default App;
