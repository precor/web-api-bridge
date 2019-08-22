import WebApiBridge from '@precor/web-api-bridge';
import { send, setSend } from './apis/send';

class WebAppLibrary {
  constructor() {
    this.webApiBridge = new WebApiBridge();
    this.webApiBridge.target = window.parent;
    const originSubstring = (process.env.NODE_ENV === 'development') ? ':3000' : 'https://known.webapp.lib.origin';
    const targetOrigin = (process.env.NODE_ENV === 'development') ? '*' : 'https://known.webapp.lib.origin';
    console.log(`default origin: ${originSubstring}, targetOrigin : ${targetOrigin}`);
    this.webApiBridge.origin = originSubstring;
    this.webApiBridge.targetOrigin = targetOrigin;
    setSend(this.webApiBridge.send.bind(this.webApiBridge));
    this.webApiBridge.apis = [this]; // ready function
    window.addEventListener('message', (event) => {
      if (event && event.source === this.webApiBridge.target) {
        this.webApiBridge.onMessage(event, event.data);
      }
    });
  }

  startApis = (origin, logMessages) => {
    if (origin) {
      this.webApiBridge.origin = origin;
      this.webApiBridge.targetOrigin = origin;
    }
    this.webApiBridge.listener = logMessages;
    return send('startApis', null, true).then((libInfo) => {
      const { apis } = libInfo;
      apis.forEach((apiName) => {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        const api = require(`./apis/${apiName}`);
        this.webApiBridge.apis.push(api.incomingCalls);
      });
      return Promise.resolve(libInfo);
    });
  }
}

const webAppLibrary = new WebAppLibrary();

// eslint-disable-next-line import/prefer-default-export
export const { startApis } = webAppLibrary;

export * as libType1 from './LibType1';
export * as libType2 from './LibType2';
