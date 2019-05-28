// import { send } from './Send';

export const incomingCalls = {
  photoSelected: null,
};

export const setCallback = (funcName, implementation) => {
  if (incomingCalls[funcName] === undefined) {
    throw new Error(`${funcName} is not a valid function`);
  }
  incomingCalls[funcName] = implementation;
};
