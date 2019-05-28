import { send } from './Send';

export const photoClicked = (id) => {
  send('photoClicked', [id], false);
};

export const incomingCalls = {
  displayNewPhoto: null,
};

export const setCallback = (funcName, implementation) => {
  if (incomingCalls[funcName] === undefined) {
    throw new Error(`${funcName} is not a valid function`);
  }
  incomingCalls[funcName] = implementation;
};
