import { registerCallback } from '../registerCallback';

export const incomingCalls = {
  displayBlur: null,
  displayGrayscale: null,
};

export const setCallback = (funcName, implementation) =>
  registerCallback(incomingCalls, funcName, implementation);
