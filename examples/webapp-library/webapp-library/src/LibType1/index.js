import {
  incomingCalls as commonIncomingCalls,
  setCallback as commonSetCallback,
} from './Common/callbacks';

import {
  incomingCalls as api1IncomingCalls,
  setCallback as api1SetCallback,
} from './Api1/callbacks';


export const incomingCalls = {
  ...commonIncomingCalls,
  ...api1IncomingCalls,
};

export const setCallback = (funcName, implementation) => {
  if (commonIncomingCalls[funcName] !== undefined) {
    commonSetCallback(funcName, implementation);
  } else {
    api1SetCallback(funcName, implementation);
  }
};
