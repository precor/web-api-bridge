/* eslint-env browser */
import React from 'react';
import {arrayOf, object, func, shape, string} from 'prop-types';
import {WebView} from 'react-native-webview';
import WebApiBridge from '@precor/web-api-bridge';

function WebViewApi({apis, setSend, listener, ...rest}) {
  const webApiBridge = new WebApiBridge();
  const onMessage = (event) => {
    webApiBridge.onMessage(event, event.nativeEvent.data);
  };
  webApiBridge.apis = apis;
  setSend(webApiBridge.send.bind(webApiBridge));
  webApiBridge.listener = listener;

  return (
    <WebView
      {...rest}
      originWhitelist={['*']}
      javaScriptEnabled
      ref={(webview) => {
        webApiBridge.target = webview;
      }}
      onMessage={onMessage}
      scrollEnabled={false}
      automaticallyAdjustContentInsets={false}
      bounces={false}
      onError={(err) => {
        console.log(err);
      }}
    />
  );
}

WebViewApi.propTypes = {
  apis: arrayOf(object).isRequired,
  setSend: func.isRequired,
  source: shape({uri: string}).isRequired,
  listener: func,
};

WebViewApi.defaultProps = {
  listener: undefined,
};

export default WebViewApi;
