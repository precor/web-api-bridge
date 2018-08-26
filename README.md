# WebApiBridge

`WebApiBridge` is a plain JavaScript class that can be used in a React Native application and in a web app running in a React Native [WebView](https://facebook.github.io/react-native/docs/webview.html) to support a function call API between the two. It can also be used as an IPC mechanism between a web page and an iframe. The intention is for this code to be used in a web app that is using either a framework or pure JavaScript so framework code was kept out of this class.

## Features

* Provides support for API calls between JavaScript processes. Each process can support API calls in an array of JavaScript objects (inluding React components)
* Marshalls plain JavaScript parameters and return values via `JSON.stringify()`
* Works for React Native webviews
* Works for communication between a web page and iframe based window
* Provides promise support for asynchronous API calls that need to return results
* Marshalls exceptions thown in API calls to the caller
* Validates the existance of API call and message delivery so reliability errors are reported
* Allows setting of origin and targetOrigin restrictions
* A `listener()` function hook that will be passed all messages sent/received

## Installation

If you're using `npm`:

```console
npm install --save @precor/web-api-bridge
```

or, if you're using `yarn`:

```console
yarn add @precor/web-api-bridge
```

## Documentation

[WebViewBridge Class](https://github.com/precor/web-api-bridge/blob/master/docs/WEBVIEWBRIDGE.md)

## Examples

Coming ...

## Gotchas

* Beware that messages passed before `onLoad` is called will probably not get through.
* Type files for Flow and TypeScript are included but not used by our projects so they may have issues. Please submit an issue or better yet a pull request with corrections.

## History

The starting point for this was [Communicating between React Native and the WebView](https://medium.com/capriza-engineering/communicating-between-react-native-and-the-webview-ac14b8b8b91a) and the corresponding [WebApiBridge sample](https://gist.github.com/blankg/d5537a458b55b9d15cb4fd78258ad840). Message delivery problems seem to be a thing of the past so the promise chain implementation was dropped and the implementation is now substantially evolved.
