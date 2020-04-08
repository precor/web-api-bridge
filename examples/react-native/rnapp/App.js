/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {SafeAreaView, StyleSheet, StatusBar} from 'react-native';
import WebViewApi from './WebViewApi';

class MyMainApi {
  send = undefined;

  setSend(send) {
    this.send = send;
  }

  onload = () => {
    console.log('webapp loaded');
    this.welcome('hello webapp');
  };

  welcome = (message) => {
    console.log('sending welcome message to iframe');
    this.send('welcome', [message], false);
  };

  howOldAreYou = () =>
    new Promise((resolve) => {
      console.log('sending age to iframe');
      resolve(3);
    });
}

const App: () => React$Node = () => {
  const myMainApi = new MyMainApi();
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.fullscreen}>
        <WebViewApi
          source={{uri: 'http://192.168.0.14:3000/'}}
          apis={[myMainApi]}
          setSend={(send) => {
            myMainApi.setSend(send);
          }}
          onLoadEnd={myMainApi.onload}
          onError={(syntheticEvent) => {
            const {nativeEvent} = syntheticEvent;
            console.warn('WebView error: ', nativeEvent);
          }}
          // enable the listener to log all messages
          // listener={(message) => {
          //   console.log(message);
          // }}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
  },
});

export default App;
