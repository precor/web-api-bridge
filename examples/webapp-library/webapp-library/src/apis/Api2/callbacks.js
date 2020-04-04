import { registerCallback } from '../registerCallback';

export const incomingCalls = {
  displayNewPhoto: null,
};

export const setCallback = (funcName, implementation) =>
  registerCallback(incomingCalls, funcName, implementation);
