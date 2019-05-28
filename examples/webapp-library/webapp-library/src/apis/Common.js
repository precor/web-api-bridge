// import { send } from './Send';

export const incomingCalls = {
  displayBlur: null,
  displayGrayscale: null,
};

export const setCallback = (funcName, implementation) => {
  if (incomingCalls[funcName] === undefined) {
    throw new Error(`${funcName} is not a valid function`);
  }
  incomingCalls[funcName] = implementation;
};
