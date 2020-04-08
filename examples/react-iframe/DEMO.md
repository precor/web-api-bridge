# examples/react-iframe

[source](https://github.com/precor/web-api-bridge/tree/master/examples/react-iframe/)

<iframe src="https://precor.github.io/web-api-bridge/examples/react-iframe/parent/build/" width="320" height="280" frameborder="0" style="float: left; margin-right: 10px" ></iframe>

`react-iframe` is an example React.js project that uses `web-api-bridge` to a communicate with an iframe.

A parent window loads a web app in an iframe and implements an API that sends a message using a `welcome()` function. The web app that is loaded as the iframe implements an API that gets the`welcome()` call and responds with a `howOldAreYou()` function call. The parent then responds to `howOldAreYou()` with 3.
