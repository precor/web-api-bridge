import {
  incomingCalls as commonIncomingCalls,
  setCallback as commonSetCallback,
} from './Common/callbacks';

import {
  incomingCalls as api2IncomingCalls,
  setCallback as api2SetCallback,
} from './Api2/callbacks';

export const incomingCalls = {
  ...commonIncomingCalls,
  ...api2IncomingCalls,
};

export const setCallback = (funcName, implementation) => {
  if (commonIncomingCalls[funcName] !== undefined) {
    commonSetCallback(funcName, implementation);
  } else {
    api2SetCallback(funcName, implementation);
  }
};

export * as api2 from './Api2/apis';
export * as api3 from './Api3/apis';
