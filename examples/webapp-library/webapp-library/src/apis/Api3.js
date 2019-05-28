import { send } from './Send';

export const setGrayscale = (grayscale) => {
  send('setGrayscale', [grayscale], false);
};

export const setBlur = (blurAmount) => {
  send('setBlur', [blurAmount], false);
};

export const incomingCalls = {
};

export const setCallback = (funcName, implementation) => {
  if (incomingCalls[funcName] === undefined) {
    throw new Error(`${funcName} is not a valid function`);
  }
  incomingCalls[funcName] = implementation;
};
