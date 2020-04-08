/* eslint-env browser */
import React from 'react';
import {arrayOf, object, func, shape, string} from 'prop-types';
import {WebView} from 'react-native-webview';
import WebApiBridge from '@precor/web-api-bridge';

// postMessage() results in the webapp getting the message on the document
// object in android and the window object in ios. Since react-native-webvew
// has deprecated the webview object postMessage() function anyway, we'll
// inject this iffy as a replacement when the webview object becomes available.
const dispatchMessageEvent = (data) =>
  `(function() {
    window.dispatchEvent(new MessageEvent('message', {
      data: ${JSON.stringify(data)}
    }));
  })()`;

function WebViewApi({apis, setSend, listener, ...rest}) {
  const webApiBridge = new WebApiBridge();
  webApiBridge.apis = apis;
  setSend(webApiBridge.send.bind(webApiBridge));
  webApiBridge.listener = listener;
  const onMessage = (event) => {
    webApiBridge.onMessage(event, event.nativeEvent.data);
  };

  return (
    <WebView
      {...rest}
      originWhitelist={['*']}
      javaScriptEnabled
      ref={(webView) => {
        if (webView) {
          console.log('webView ref available');
          webView.postMessage = (message) =>
            webView.injectJavaScript(dispatchMessageEvent(message));
          webApiBridge.target = webView;
        }
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
