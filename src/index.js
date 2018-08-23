/**
 * @class
 * @description
 * `WebApiBridge` is a JavaScript class that can be used in a React Native application
 * and in a web app running in a React Native [WebView](https://facebook.github.io/react-native/docs/webview.html)
 * to support a function call interface between the two. It can also be used as an IPC mechanism
 * between a web site and the code running in an iframe.
 *
 * WebApiBridge works by passing `Message` objects between Javascript processes.
 * A `prop-types` declaration of a Message object would look like this:
 *
 * ```javascript
 *   export const Message = PropTypes.shape({
 *     type: PropTypes.oneOf(['response', 'request']),
 *     msgId: PropTypes.number,
 *     targetFunc: PropTypes.string,
 *     args: PropTypes.arrayOf(PropTypes.any),
 *     wantResult: PropTypes.bool,
 *   });
 * ```
 */

class WebApiBridge {
  constructor() {
    /**
     * Property of the api objects that contain methods for incoming api function
     * calls. This is an array of objects so that a single `WebViewApi` can have
     * multiple APIs. The last API with a function is used if the function exists
     * in more than one API.
     */
    this.apis = [];

    /**
     * Property for the Inter Process Communications object that will handle
     * messages from the other-side. This is the `window` object on a web page
     * and the `ref` for the `WebView` component on the React Native side.
     */
    this.ipc = {};

    /**
     * Listener functions can monitor all `Message` objects exchanged
     * between `WebApiBridge` objects. Listener functions are attached to `WebApiBridge` instances
     * by setting the `listener` property.
     */
    this.listener = null;

    /**
     * Property for validating the origin of received messages. The property is set to a substring
     * of the origin to be matched in browser windows. This makes it easy to provide some checking
     * in development mode, for example, `':3000'` will allow messages from any server using port
     * 3000. By default it's set to `''`, which will allow messages from any origin. This field
     * should be set as restrictrively as possible. e.g. `'https://www.mydomain.com:3000'`. Note
     * that his property is irrelevant in React Native WebViews.
     */
    this.origin = '';

    /**
     * Property for specifying the origin of the target window in messages sent to browser windows.
     * By default it's set to `'*'`, which will allow messages to any document. This field
     * should be set as restrictrively as possible. e.g. `'https://www.mydomain.com:3000'`. Note
     * that his property is irrelevant in React Native WebViews.
     */
    this.targetOrigin = '*';

    this.sendCompletions = {};
    this.currentId = 0; // id for sent messages
    this.idLastRxRequest = 0; // msdId of last request received
  }

  newMsgId() {
    this.currentId += 1;
    return (this.currentId % Number.MAX_SAFE_INTEGER);
  }

  handleResponse(response) {
    const {
      msgId, args, error,
    } = response;
    if (this.sendCompletions[msgId]) {
      if (error) {
        this.sendCompletions[msgId].reject(response);
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
    this.ipc.postMessage(JSON.stringify(response), this.targetOrigin);
  }

  handleRequest(request) {
    const response = request;
    try {
      // validate whether or not we expected this request
      // no modulo is required 9007199254740991 between restarts, so keeping it simple:
      if (request.msgId !== this.idLastRxRequest + 1
        && request.msgId !== 1 && this.idLastRxRequest) {
        // could ignore an invalid ID but that could result in dead interface so
        // we'll just generate a warning
        console.warn(`expected request with { msgID: ${this.idLastRxRequest + 1} } got: ${JSON.stringify(request)}`);
      }
      this.idLastRxRequest = request.msgId;

      // process the request
      const api = this.apis.filter(elem => elem[request.targetFunc] !== undefined).pop();
      if (!api) {
        console.warn(`${request.targetFunc} function does not exist`);
        throw new Error('function does not exist');
      }
      if (request.wantResult) {
        api[request.targetFunc].apply(this, request.args)
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
   * @param {object} event - Incomming event.
   * @param {string} data - The incoming data received, which is a stingified JSON
   * message. Defaults to `event.nativeEvent.data`, which is correct for React Native
   * but needs to be overridden for the web app with `event.data`.
   */
  onMessage(event, data = event.nativeEvent.data) {
    if (event.origin && event.origin.search(this.origin) === -1) {
      return;
    }
    let message;
    try {
      message = JSON.parse(data); // event.nativeEvent.data);
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
    this.ipc.postMessage(JSON.stringify(message), this.targetOrigin);
  }

  /**
   * Invoke a function on the remote.
   * Returns a `Promise` object.
   * @param {string} targetFunc - A string of the name of the api function to execute.
   * @param {Array} args - An array of parameters to be passsed to the `targetFun`.
   * @param {boolean} wantResult - Boolean to indicate if a `Promise` should be `fullfilled`
   *    or `rejected` after the remote api completes the call. If `false` then no `Promise`
   *    will be `fullfilled`.
   * @returns {Promise} Promise object if `wantResult` is `true`, `null` if not.
   */
  send(targetFunc, args, wantResult = false) {
    const msgId = this.newMsgId();
    const message = {
      type: 'request', wantResult, targetFunc, args, msgId, error: null,
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
