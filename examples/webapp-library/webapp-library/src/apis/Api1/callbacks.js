import { registerCallback } from '../registerCallback';

export const incomingCalls = {
  photoSelected: null,
};

export const setCallback = (funcName, implementation) => (
  registerCallback(incomingCalls, funcName, implementation)
);
