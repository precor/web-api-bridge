
import React, { Component } from 'react';
import { string, arrayOf } from 'prop-types';
import WebApiBridge from '@precor/web-api-bridge';

// to keep track of created iframes that use webApiBridges
const bridgedIframes = [];

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
    const api1Iframe = bridgedIframes.find(bridgedIframe => (
      bridgedIframe.props.type === 'LibType1'
    ));
    api1Iframe.getApiOfType('Api1').photoSelected(id);
    bridgedIframes.forEach((bridgedIframe) => {
      if (bridgedIframe.send !== this.send && bridgedIframe.props.type === 'LibType2') {
        bridgedIframe.getApiOfType('Api2').displayNewPhoto();
      }
    });
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
    bridgedIframes.forEach((bridgedIframe) => {
      bridgedIframe.getApiOfType('Common').displayGrayscale(grayscale);
    });
  };

  setBlur = (blur) => {
    bridgedIframes.forEach((bridgedIframe) => {
      bridgedIframe.getApiOfType('Common').displayBlur(blur);
    });
  };
}

const apiMap = {
  Common, Api1, Api2, Api3,
};

class BridgedIframe extends Component {
  setIframe = (iframe) => {
    if (!iframe || this.iframe) {
      return;
    }
    this.iframe = iframe;
    const { src, type, apis } = this.props;

    const url = new URL(src);
    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.origin = url.origin;
    this.webApiBridge.targetOrigin = url.origin;
    this.send = this.webApiBridge.send.bind(this.webApiBridge);
    bridgedIframes.push(this);
    this.webApiBridge.target = iframe.contentWindow;
    window.addEventListener('message', (event) => {
      if (event && event.source === this.webApiBridge.target) {
        this.webApiBridge.onMessage(event, event.data);
      }
    });
    this.webApiBridge.apis = apis.map((apiClassName) => {
      const api = new apiMap[apiClassName]();
      api.setSend(this.send);
      return api;
    });
    this.iframe.onload = () => {
      console.log(`${iframe.src} loaded`);
      this.send('ready', [{ type, apis }], false);
    };
  };

  getApiOfType = apiName => (
    this.webApiBridge.apis.find(api => (
      api instanceof apiMap[apiName]
    ))
  );

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
