
import React from 'react';
import WebApiBridge from '@precor/web-api-bridge';

// createLibInstance factory, libs use apis to communicate through a bridge
const createLibInstance = ({ webApiBridge, apis }) => ({
  webApiBridge,
  apis,
  findApiOfType(apiName) {
    return this.webApiBridge.apis.find(api => (api instanceof apiMap[apiName]));
  },
});

// to keep track of created libs that use apis to communicate
class libInstances {
  static instances = [];

  static add = libInstance => libInstances.instances.push(libInstance);

  static executeOnType = (apiName, fn) => {
    libInstances.instances.forEach((instance) => {
      const api = instance.findApiOfType(apiName);
      if (api) fn(api);
    });
  }
}

class Common {
  setSend = (send) => {
    this.send = send;
  };

  displayBlur = (blur) => {
    this.send('displayBlur', [blur], false);
  };

  displayGrayscale = (grayScale) => {
    this.send('displayGrayscale', [grayScale], false);
  };
}

class Api1 {
  setSend = (send) => {
    this.send = send;
  };

  photoSelected = (id) => {
    this.send('photoSelected', [id], false);
  };
}

class Api2 {
  setSend = (send) => {
    this.send = send;
  };

  photoClicked = (id) => {
    libInstances.executeOnType('Api1', api => api.photoSelected(id));
    libInstances.executeOnType('Api2', (api) => { if (api !== this) api.displayNewPhoto(); });
  };

  displayNewPhoto = () => {
    this.send('displayNewPhoto', null, false);
  };
}

class Api3 {
  setSend = (send) => {
    this.send = send;
  };

  setGrayscale = (grayscale) => {
    libInstances.executeOnType('Common', api => api.displayGrayscale(grayscale));
  };

  setBlur = (blur) => {
    libInstances.executeOnType('Common', api => api.displayBlur(blur));
  };
}

const apiMap = {
  Common, Api1, Api2, Api3,
};

const BridgedIframe = ({
  src, type, apis, ...rest
}) => {
  console.log(`render iframe: ${src}`);

  const setIframe = (iframe) => {
    const url = new URL(src);
    const webApiBridge = new WebApiBridge();
    webApiBridge.origin = url.origin;
    webApiBridge.targetOrigin = url.origin;
    const send = webApiBridge.send.bind(webApiBridge);
    libInstances.add(createLibInstance({ webApiBridge, apis }));
    webApiBridge.target = iframe.contentWindow;
    window.addEventListener('message', (event) => {
      if (event && event.source === webApiBridge.target) {
        webApiBridge.onMessage(event, event.data);
      }
    });
    webApiBridge.apis = apis.map((apiClassName) => {
      const api = new apiMap[apiClassName]();
      api.setSend(send);
      return api;
    });
    iframe.onload = () => {
      console.log(`${iframe.src} loaded`);
      setTimeout(() => {
        send('ready', [{ type, apis }], false);        
      }, 30);
    };
  };

  return (
    <iframe
      src={src}
      title={src}
      ref={(iframe) => { setIframe(iframe); }}
      scrolling="no"
      {...rest}
    />
  );
};

export default BridgedIframe;
