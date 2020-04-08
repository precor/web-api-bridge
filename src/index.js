/**
 * @class
 * @description
 * `WebApiBridge` provides a function call API interface between Javascript processes
 * that pass `MessageEvent` objects such as a a web page and an iframe or a React Native
 * application and a web app running in a [react-native-webview](https://github.com/react-native-community/react-native-webview).
 */

class WebApiBridge {
  constructor() {
    /**
     * Property of the api objects that contain methods for incoming api function
     * calls. This is an array of objects so that a single `WebViewApi` can have
     * multiple APIs. The first API with a function is used if the function exists
     * in more than one API.
     */
    this.apis = [];

    /**
     * Property for target object to post messages to the other side. Typically the `window`,
     * or a `window.parent` for an iframe in a normal web page. For the `WebView`
     * component on the React Native side use the `ref`, and for the web side of
     * [react-native-webview](https://github.com/react-native-community/react-native-webview)
     * use `window.parent` for iOS and `window` for Android.
     */
    this.target = {};

    /**
     * Property that should be truthy for a webview using
     * [react-native-webview](https://github.com/react-native-community/react-native-webview). When set
     * `target.ReactNativeWebView.postMessage` will be used instead of `target.postMessage`.
     */
    this.useReactNativeWebView = undefined;

    /**
     * Property that can be set to a function that can monitor all `Message` objects exchanged
     * between `WebApiBridge` objects.
     */
    this.listener = null;

    /**
     * Property for validating the origin of received messages. The property is set to a substring
     * of the origin to be matched in browser windows. This makes it easy to provide some checking
     * in development mode, for example, `':3000'` will allow messages from any server using port
     * 3000. By default it's set to `''`, which will allow messages from any origin. This property
     * should be set as restrictively as possible. e.g. `'https://www.mydomain.com:3000'`. Note
     * that his property is irrelevant in React Native WebViews.
     */
    this.origin = '';

    /**
     * Property for specifying the origin of the target window in messages sent to browser windows.
     * By default it's set to `'*'`, which will allow messages to any document. This property
     * should be set as restrictrively as possible. e.g. `'https://www.mydomain.com:3000'`. Note
     * that his property is irrelevant in React Native WebViews.
     */
    this.targetOrigin = '*';

    this.sendCompletions = {};
    this.currentId = 0; // id for sent messages
  }

  newMsgId() {
    this.currentId += 1;
    return this.currentId % Number.MAX_SAFE_INTEGER;
  }

  handleResponse(response) {
    const { msgId, args, error } = response;
    if (this.sendCompletions[msgId]) {
      if (error) {
        this.sendCompletions[msgId].reject(new Error(error));
      } else {
        this.sendCompletions[msgId].resolve.apply(this, args);
      }
      delete this.sendCompletions[msgId];
    } else if (error && error !== 'function does not exist') {
      console.warn(`${JSON.stringify(response)}`);
    }
  }

  sendResponse(response) {
    response.type = 'response';
    if (this.listener) this.listener(response);
    if (this.useReactNativeWebView) {
      this.target.ReactNativeWebView.postMessage(JSON.stringify(response));
    } else {
      this.target.postMessage(JSON.stringify(response), this.targetOrigin);
    }
  }

  handleRequest(request) {
    // if the listener is active then console.log() may keep a reference to the object
    // and log it at some time in the future so the request needs to be copied
    const response = { ...request };
    try {
      // process the request
      const api = this.apis.find((elem) => elem[request.targetFunc]);
      if (!api) {
        console.warn(`${request.targetFunc} function does not exist`);
        throw new Error('function does not exist');
      }
      if (request.wantResult) {
        api[request.targetFunc]
          .apply(this, request.args)
          .then((result) => {
            response.args = [result];
            this.sendResponse(response);
          })
          .catch((error) => {
            response.error = error.message;
            this.sendResponse(response);
          });
        return;
      }
      api[request.targetFunc].apply(this, request.args);
    } catch (error) {
      response.error = error.message;
    }
    // return any error results
    if (response.error) {
      this.sendResponse(response);
    }
  }

  /**
   * Function that should get called when an event containing a message is received
   * from the other side.
   * @param {object} event Incomming event.
   * @param {string} data The incoming data received, which is a stingified JSON
   * message. Defaults to `event.nativeEvent.data`, which is correct for React Native
   * but needs to be overridden for web apps with `event.data`.
   */
  onMessage(event, data = event.nativeEvent.data) {
    if (event.origin && event.origin.search(this.origin) === -1) return;
    if (typeof data !== 'string' || data.indexOf('"targetFunc":') === -1) {
      return;
    }
    let message;
    try {
      message = JSON.parse(data);
    } catch (err) {
      console.warn(err);
      return;
    }
    if (this.listener) this.listener(message);
    if (message.type === 'response') {
      this.handleResponse(message);
    } else if (message.type === 'request') {
      this.handleRequest(message);
    } else {
      console.warn(`invalid message received: ${data}`);
    }
  }

  doSend(message) {
    if (this.listener) this.listener(message);
    if (this.useReactNativeWebView) {
      this.target.ReactNativeWebView.postMessage(JSON.stringify(message));
    } else {
      this.target.postMessage(JSON.stringify(message), this.targetOrigin);
    }
  }

  /**
   * Invoke a function on the remote.
   *
   * @param {string} targetFunc A string of the name of the api function to execute.
   * @param {Array} args An array of parameters to be passsed to the `targetFun`.
   * @param {boolean} wantResult Boolean to indicate if a `Promise` should be `fullfilled`
   *    or `rejected` after the remote api completes the call. If `false` then no `Promise`
   *    will be `fullfilled`.
   * @returns {Promise} if `wantResult` is `true`, `void` if not.
   */
  send(targetFunc, args, wantResult = false) {
    const msgId = this.newMsgId();
    const message = {
      type: 'request',
      wantResult,
      targetFunc,
      args,
      msgId,
      error: null,
    };
    if (wantResult) {
      return new Promise((resolve, reject) => {
        this.sendCompletions[msgId] = { resolve, reject };
        this.doSend(message);
      });
    }
    this.doSend(message);
    return null;
  }
}

export default WebApiBridge;
