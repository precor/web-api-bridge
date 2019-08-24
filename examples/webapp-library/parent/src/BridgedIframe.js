/* eslint-disable max-classes-per-file */
import React from 'react';
import WebApiBridge from '@precor/web-api-bridge';
import { arrayOf, string } from 'prop-types';

// createLibInstance factory, libs use apis to communicate through a bridge
const createLibInstance = ({ webApiBridge, apis }) => ({
  webApiBridge,
  apis,
  findApiOfType(apiName) {
    // eslint-disable-next-line no-use-before-define
    return this.webApiBridge.apis.find((api) => (api instanceof apiMap[apiName]));
  },
});

const registeredSend = (bridgeSend, outgoingCalls) => (funcName, args, wantResponse) => {
  if (outgoingCalls[funcName]) {
    return bridgeSend(funcName, args, wantResponse);
  }
  console.log(`${funcName} was not registered`);
  return null;
};

// to keep track of created libs that use apis to communicate
class libInstances {
  static instances = [];

  static add = (libInstance) => libInstances.instances.push(libInstance);

  static executeOnType = (apiName, fn) => {
    libInstances.instances.forEach((instance) => {
      const api = instance.findApiOfType(apiName);
      if (api) fn(api);
    });
  }
}

class Common {
  constructor() {
    this.outgoingCalls = {
      displayBlur: null,
      displayGrayscale: null,
    };
  }

  setSend = (bridgeSend) => {
    this.send = registeredSend(bridgeSend, this.outgoingCalls);
  }

  displayBlur = (blur) => {
    this.send('displayBlur', [blur], false);
  };

  displayGrayscale = (grayScale) => {
    this.send('displayGrayscale', [grayScale], false);
  };
}

class Api1 {
  constructor() {
    this.outgoingCalls = {
      photoSelected: null,
    };
  }


  setSend = (bridgeSend) => {
    this.send = registeredSend(bridgeSend, this.outgoingCalls);
  }

  photoSelected = (id) => {
    this.send('photoSelected', [id], false);
  };
}

class Api2 {
  constructor() {
    this.outgoingCalls = {
      displayNewPhoto: null,
    };
  }


  setSend = (bridgeSend) => {
    this.send = registeredSend(bridgeSend, this.outgoingCalls);
  }

  photoClicked = (id) => {
    libInstances.executeOnType('Api1', (api) => api.photoSelected(id));
    libInstances.executeOnType('Api2', (api) => { if (api !== this) api.displayNewPhoto(); });
  };

  displayNewPhoto = () => {
    this.send('displayNewPhoto', null, false);
  };
}

class Api3 {
  setSend = () => {};

  setGrayscale = (grayscale) => {
    libInstances.executeOnType('Common', (api) => api.displayGrayscale(grayscale));
  };

  setBlur = (blur) => {
    libInstances.executeOnType('Common', (api) => api.displayBlur(blur));
  };
}

const apiMap = {
  Common, Api1, Api2, Api3,
};

class BridgedIframe extends React.Component {
  constructor(props) {
    super(props);
    const { src, type, apis } = props;
    const url = new URL(src);
    this.type = type;
    this.apis = apis;
    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.origin = url.origin;
    this.webApiBridge.targetOrigin = url.origin;
    const send = this.webApiBridge.send.bind(this.webApiBridge);
    libInstances.add(createLibInstance({ webApiBridge: this.webApiBridge, apis }));
    window.addEventListener('message', this.messageListener);
    this.webApiBridge.apis = apis.map((apiClassName) => {
      const api = new apiMap[apiClassName]();
      api.setSend(send);
      return api;
    });
    this.webApiBridge.apis.push(this);
  }

  componentWillUnmount() {
    this.webApiBridge.apis.forEach((apiObj) => {
      const api = apiObj;
      if (api.outgoingCalls) {
        Object.keys(api.outgoingCalls).forEach((funcName) => {
          api.outgoingCalls[funcName] = null;
        });
      }
    });
    window.removeEventListener('message', this.messageListener);
  }

  messageListener = (event) => {
    if (event && event.source === this.webApiBridge.target) {
      this.webApiBridge.onMessage(event, event.data);
    }
  };

  startApis = () => (
    new Promise((resolve) => resolve({ type: this.type, apis: this.apis }))
  );

  registerCallback = (funcName, implemented) => (
    new Promise((resolve) => {
      const api = this.webApiBridge.apis.find((apiInstance) => (
        apiInstance.outgoingCalls[funcName]) !== undefined);
      if (!api) {
        throw new Error(`registerCallback failed, ${funcName} does not exist`);
      }
      api.outgoingCalls[funcName] = implemented;
      resolve();
    })
  );

  setIframe = (iframe) => {
    if (!iframe || this.iframe) {
      return;
    }
    this.iframe = iframe;
    this.webApiBridge.target = iframe.contentWindow;
  };

  render() {
    const {
      src, type, apis, ...rest
    } = this.props;
    console.log(`render iframe: ${src}`);
    return (
      <iframe
        src={src}
        title={src}
        ref={(iframe) => { this.setIframe(iframe); }}
        scrolling="no"
        {...rest}
      />
    );
  }
}

BridgedIframe.propTypes = {
  src: string.isRequired,
  type: string.isRequired,
  apis: arrayOf(string).isRequired,
};

export default BridgedIframe;
