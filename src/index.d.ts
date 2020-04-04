interface Target {
  postMessage(
    message: any,
    targetOrigin: string,
    transfer?: Transferable[] | undefined,
  ): void;
  ReactNativeWebView?: {
    postMessage(message: string): void;
  };
}

/**
 * `Message` objects are exchanged between the react native app and a
 * webview. They can be monitored by attaching a `Listener` to the `WebApiBridge`
 * through a `WebViewApi` object.
 */
export interface Message {
  msgType: 'response' | 'request';
  msgId: number;
  targetFunc: string;
  args: Array<any>;
  wantResult: boolean;
  error: string | null;
}

/**
 * `Listener` functions can monitor all `Message` objects exchanged between `WebApiBridge`
 * objects. `Listener` functions are attached to WebApiBridge` objects by setting the
 * `WebApiBridge listener` property. In a react application this would be done in the `WebViewApi`
 * that wants to listen to the bridge.
 */
export type Listener = (message: Message) => void;

/**
 * Invoke a function on the remote.
 *
 * @param {string} targetFunc A string of the name of the api function to execute.
 * @param {Array} args An array of parameters to be passsed to the `targetFun`.
 * @param {boolean} wantResult - Boolean to indicate if a `Promise` should be `fullfilled`
 *    or `rejected` after the remote api completes the call. If `false` then no `Promise`
 *    will be `fullfilled`.
 * @returns {Promise} if `wantResult` is `true`, `void` if not.
 */
export type Send = (
  apiCall: string,
  params: any[] | null,
  wantResult?: boolean,
) => void | Promise<any>;

/**
 * Function that should get called when an event containing a message is received
 * from the other side.
 * @param {object} event Incomming event.
 * @param {string} data The incoming data received, which is a stingified JSON
 * message. Defaults to `event.nativeEvent.data`, which is correct for React Native
 * but needs to be overridden for web apps with `event.data`.
 */
export type OnMessage = (event: Event, data?: any) => void;

/**
 * `WebApiBridge` provides a function call API interface between Javascript processes that pass `MessageEvent`
 * objects such as a a web page and an iframe or a React Native application and
 * in a web app running in a [react-native-webview](https://github.com/react-native-community/react-native-webview).
 */
export default class WebApiBridge {
  listener: Listener | null;
  target: Target;
  useReactNativeWebView: boolean;
  send: Send;
  apis: {}[];
  onMessage: OnMessage;
}
