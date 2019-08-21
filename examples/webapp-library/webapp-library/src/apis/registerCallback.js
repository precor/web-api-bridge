import { send } from './send';

export const registerCallback = (incomingCalls, funcName, implementation) => {
  const incomingApi = incomingCalls;
  if (incomingCalls[funcName] === undefined) {
    return Promise.reject(new Error('unknown function'));
  }
  incomingApi[funcName] = implementation;
  return send('registerCallback', [funcName], true);
};

export default registerCallback;
