import { send } from './send';

export const registerCallback = (incomingCalls, funcName, implementation) => {
  const incomingApi = incomingCalls;
  if (incomingCalls[funcName] === undefined) {
    return Promise.reject(new Error('unknown function'));
  }
  if (implementation !== null && typeof implementation !== 'function') {
    return Promise.reject(new Error(`implementation of ${funcName} must be null or a valid function`));
  }
  incomingApi[funcName] = implementation;
  return send('registerCallback', [funcName, !!implementation], true);
};

export default registerCallback;
