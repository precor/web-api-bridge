# webapp-library/webapp-library

[demo](https://precor.github.io/web-api-bridge/examples/webapp-library/DEMO.html)

The `webapp-library` implements an example functional style library for use by web apps running in iframes. This library should be built using `yarn build` before installing npm packages in the web apps.

## Call Semantics

Web apps using the library can import functions that make api calls to the parent using standard module name space semantics.

```javascript
import { libType2 } from 'webapp-library';
...
libType2.api2.photoClicked(32);
libType2.api3.setGrayscale(true);
```

or

```javascript
import { api2, api3 } from 'webapp-library/LibType2';
...
api2.photoClicked(32);
api3.setGrayscale(true);
```

or

```javascript
import { photoClicked } from 'webapp-library/LibType2/Api2';
import { setGrayscale } from 'webapp-library/LibType2/Api3';
...
photoClicked(32);
setGrayscale(true);
```

or any combination of the above, e.g.

```javascript
import { api2 } from 'webapp-library/LibType2';
import { setGrayscale } from 'webapp-library/LibType2/Api3';
...
api2.photoClicked(32);
setGrayscale(true);
```

## Initialization

The library needs to be instantiated by the webapp. This also provides an opportunity for the parent to inform the web app of type of app it thinks it is, `LibType1` or `LibType2` in our case, and the list of apis that it can make use of:

```javascript
import { startApis } from 'webapp-library';
...
// sometime during app initialization
startApis().then(({ type, apis }) => {
  console.log('webapp is type', type);
  console.log('webapp has apis', apis);
  }
});
```

`startApis()` takes two optional parameters, the origin of the parent and a callback that displays all web-api-bridge messages. The parent origin is used in this demo but in a real application the library should be able to set this to the correct value for both debug and production purposes. The callback is only useful for testing purposes.

Internally the implementation waits for a `ready()` call from the parent that is sent when the webapp is loaded. It contains the type (a string) and an array apis (all strings). The implementation takes care of the race between whether the `ready()` call is received first or web app makes the `startApis()` call first.

## Callbacks

Callbacks are supported for each api using a `setCallback()` function.

```javascript
import { common, api2 } from 'webapp-library/LibType2';
...
// sometime during app initialization
common.setCallback('displayGrayscale', (grayscale) => {
  console.log('display photo in grayscale: ', grayscale);
  // handle the callback
  }
});

api2.setCallback('displayNewPhoto', () => {
  console.log('time to display a new photo');
  // handle the callback
  }
});
```
