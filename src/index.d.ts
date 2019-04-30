import { PostMessage } from "../lib";

/*
 * WebApiBridge should be left as a pure JS implementation. In order to
 * support typescript these declarations are supported in a separate .flow file.
 */

/**
 * `Message` objects are exchanged between the react native app and a
 * webview. They can be monitored by attaching a `Listener` to the `WebApiBridge`
 * through a `WebViewApi` object.
 */
export type Message = {
  type: "response" | "request",
  msgId: number,
  targetFunc: string,
  args: Array<any>,
  wantResult: boolean,
  sourceHref: string | undefined
}

/**
  * `Listener` functions can monitor all `Message` objects exchanged between `WebApiBridge`
  * objects. `Listener` functions are attached to WebApiBridge` objects by setting the
  * `WebApiBridge listener` property. In a react application this would be done in the `WebViewApi`
  * that wants to listen to the bridge.
  */
export type Listener = (message: Message) => void
export type Send = (apiCall: string, params: any[] | null, wantResult?: boolean) => void
export type OnMessage = (event: string, data: {}) => void

export default class WebApiBridge {
  listener: Listener | null;
  ipc: {};
  useReactNativeWebView: boolean;
  send: Send;
  apis: {}[];
  onMessage: OnMessage;
}
