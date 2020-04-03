# WebApiBridge

`WebApiBridge` provides a function call API interface between Javascript processes that pass `MessageEvent` objects such as a a web page and an iframe or a React Native application and
 a web app running in a [react-native-webview](https://github.com/react-native-community/react-native-webview).

## Features

* Provides support for API calls between JavaScript processes. Each process can support API calls in an array of JavaScript objects (inluding React components)
* Marshalls plain JavaScript parameters and return values via `JSON.stringify()` to work with [react-native-community/react-native-webview](https://github.com/react-native-community/react-native-webview), including support of [ReactNativeWebView.postMessage](https://github.com/react-native-community/react-native-webview/blob/cdbfc19cd20a0d96c9cbd13fcb8a32fcde77943b/docs/Guide.md#the-windowreactnativewebviewpostmessage-method-and-onmessage-prop)
* Works for communication between a web page and iframe child window
* Provides promise support for asynchronous API calls that need to return results
* Marshalls exceptions thown in API calls to the caller
* Validates the existance of API call and message delivery so reliability errors are reported
* Supports origin and targetOrigin settings
* A `listener()` function hook is provided for debugging that will be passed all messages sent/received

## Installation

If you're using `npm`:

```console
npm install --save @precor/web-api-bridge
```

or, if you're using `yarn`:

```console
yarn add @precor/web-api-bridge
```

## Type Checking

a Typescript definition file is included. The Proptype declaration for `Message` is included in `types/shapes.js`, i.e. to use it:

```javascript
import { Message } from '@precor/web-api-bridge/types/shapes'
```

## Documentation

[WebApiBridge Class](https://precor.github.io/web-api-bridge/docs/WEBAPIBRIDGE.html)

## Examples

[react-iframe](https://precor.github.io/web-api-bridge/examples/react-iframe/DEMO.html) is a simple react implementation of an API between a parent and an iframe.

[react-multi](https://precor.github.io/web-api-bridge/examples/react-multi/DEMO.html) is a react implementation of an API between a parent and multiple iframes.

[webapp-library](https://precor.github.io/web-api-bridge/examples/webapp-library/DEMO.html) extends the [react-multi](https://precor.github.io/web-api-bridge/examples/react-multi/DEMO.html) example by creating a functional library abstraction over the bridge for the web app iframes. It also demonstrates mulitiple apis per window and dynamic additions of apis after the iframe based web apps are loaded.

## Gotchas

* If you need to send a message from an app that loads a webview or an iframe, e.g. from a React Native app or a window parent, before receiving from that app then wait for the load to complete, e.g. `onLoad` callback to send that initial message.
