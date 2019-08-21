/* eslint-disable import/prefer-default-export */
import {
  incomingCalls as commonIncomingCalls,
  setCallback as commonSetCallback,
} from './Common/callbacks';

import {
  incomingCalls as api1IncomingCalls,
  setCallback as api1SetCallback,
} from './Api1/callbacks';

export const setCallback = (funcName, implementation) => {
  if (commonIncomingCalls[funcName] !== undefined) {
    return commonSetCallback(funcName, implementation);
  }
  if (api1IncomingCalls[funcName] !== undefined) {
    return api1SetCallback(funcName, implementation);
  }
  return Promise.reject(new Error('unknown function'));
};
