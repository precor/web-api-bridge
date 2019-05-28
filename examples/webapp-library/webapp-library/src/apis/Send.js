let sendFunc;
export const send = (...params) => sendFunc(...params);
export const setSend = (bridgeSend) => {
  sendFunc = bridgeSend;
};
